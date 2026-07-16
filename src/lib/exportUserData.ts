import { WEEKDAY_LABELS, groupLabel } from './workoutPlan'
import type { FoodLogEntry, UserNutritionProfile } from '../types/nutrition'
import type { WorkoutSession } from '../types/tracker'
import type { WeeklyPlan } from '../types/workoutPlan'

export type ExportFormat = 'excel' | 'pdf'
export type ExportDataType = 'workout' | 'calories'

export interface ExportOptions {
  format: ExportFormat
  includeWorkout: boolean
  includeCalories: boolean
  userName?: string
  sessions: WorkoutSession[]
  plan: WeeklyPlan
  nutritionProfile: UserNutritionProfile | null
  foodLogs: FoodLogEntry[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function fileStamp() {
  return new Date().toISOString().slice(0, 10)
}

export function buildWorkoutRows(sessions: WorkoutSession[]) {
  const rows: Record<string, string | number | boolean>[] = []

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      exercise.sets.forEach((set, index) => {
        rows.push({
          Session: session.name,
          Date: formatDate(session.date),
          Exercise: exercise.name,
          Set: index + 1,
          Reps: set.reps,
          'Weight (kg)': set.weight ?? '',
          Completed: set.completed ? 'Yes' : 'No',
          Warmup: set.isWarmup ? 'Yes' : 'No',
          Note: session.note ?? '',
        })
      })
    }

    if (session.exercises.length === 0) {
      rows.push({
        Session: session.name,
        Date: formatDate(session.date),
        Exercise: '—',
        Set: '',
        Reps: '',
        'Weight (kg)': '',
        Completed: '',
        Warmup: '',
        Note: session.note ?? '',
      })
    }
  }

  return rows
}

export function buildPlanRows(plan: WeeklyPlan) {
  const rows: Record<string, string | number>[] = []

  for (const day of Object.keys(plan) as (keyof WeeklyPlan)[]) {
    const dayPlan = plan[day]
    for (const group of dayPlan.muscles) {
      for (const exercise of dayPlan.exercises[group] ?? []) {
        rows.push({
          Day: WEEKDAY_LABELS[day],
          'Muscle group': groupLabel(group),
          Exercise: exercise.name,
          Sets: exercise.sets,
          Reps: exercise.reps,
          'Weight (kg)': exercise.weight ?? '',
        })
      }
    }
  }

  return rows
}

export function buildCalorieLogRows(logs: FoodLogEntry[]) {
  return [...logs]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .map((entry) => ({
      Date: formatDateTime(entry.loggedAt),
      Meal: entry.mealType,
      Food: entry.name,
      Brand: entry.brand ?? '',
      'Quantity (g)': entry.quantityGrams,
      Calories: entry.calories,
      Protein: entry.protein,
      Carbs: entry.carbs,
      Fat: entry.fat,
    }))
}

export function buildNutritionProfileRows(profile: UserNutritionProfile | null) {
  if (!profile?.onboarded) return []

  return [
    {
      Age: profile.age,
      Sex: profile.sex,
      'Height (cm)': profile.heightCm,
      'Weight (kg)': profile.weightKg,
      Activity: profile.activityLevel,
      Goal: profile.goalType,
      'Daily calories': profile.dailyCalorieTarget,
      'Protein (g)': profile.proteinTargetG,
      'Carbs (g)': profile.carbsTargetG,
      'Fat (g)': profile.fatTargetG,
    },
  ]
}

function exportExcel(options: ExportOptions, XLSX: typeof import('xlsx')) {
  const workbook = XLSX.utils.book_new()
  const stamp = fileStamp()

  if (options.includeWorkout) {
    const sessionRows = buildWorkoutRows(options.sessions)
    const planRows = buildPlanRows(options.plan)

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        sessionRows.length > 0
          ? sessionRows
          : [{ Message: 'No workout sessions logged yet' }],
      ),
      'Workouts',
    )
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        planRows.length > 0 ? planRows : [{ Message: 'No weekly plan configured' }],
      ),
      'Weekly plan',
    )
  }

  if (options.includeCalories) {
    const logRows = buildCalorieLogRows(options.foodLogs)
    const profileRows = buildNutritionProfileRows(options.nutritionProfile)

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        profileRows.length > 0
          ? profileRows
          : [{ Message: 'Nutrition profile not set up' }],
      ),
      'Nutrition profile',
    )
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        logRows.length > 0 ? logRows : [{ Message: 'No food logs yet' }],
      ),
      'Food logs',
    )
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  downloadBlob(blob, `onemorerep-export-${stamp}.xlsx`)
}

function addTableSection(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  title: string,
  headers: string[],
  rows: string[][],
  startY: number,
) {
  let y = startY

  if (y > 250) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 14, y)
  y += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  if (rows.length === 0) {
    doc.text('No data available.', 14, y)
    return y + 12
  }

  const colWidth = (doc.internal.pageSize.getWidth() - 28) / headers.length

  doc.setFont('helvetica', 'bold')
  headers.forEach((header, i) => {
    doc.text(header, 14 + i * colWidth, y, { maxWidth: colWidth - 2 })
  })
  y += 6

  doc.setFont('helvetica', 'normal')
  for (const row of rows) {
    if (y > 280) {
      doc.addPage()
      y = 20
      doc.setFont('helvetica', 'bold')
      headers.forEach((header, i) => {
        doc.text(header, 14 + i * colWidth, y, { maxWidth: colWidth - 2 })
      })
      y += 6
      doc.setFont('helvetica', 'normal')
    }

    row.forEach((cell, i) => {
      doc.text(String(cell), 14 + i * colWidth, y, { maxWidth: colWidth - 2 })
    })
    y += 6
  }

  return y + 8
}

function exportPdf(options: ExportOptions, jsPDF: typeof import('jspdf').jsPDF) {
  const doc = new jsPDF()
  const stamp = fileStamp()
  let y = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('OneMoreRep Data Export', 14, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (options.userName) {
    doc.text(`Exported for ${options.userName}`, 14, y)
    y += 6
  }
  doc.text(`Generated ${formatDateTime(new Date().toISOString())}`, 14, y)
  y += 12

  if (options.includeWorkout) {
    const sessionRows = buildWorkoutRows(options.sessions)
    y = addTableSection(
      doc,
      'Workout sessions',
      ['Session', 'Date', 'Exercise', 'Set', 'Reps', 'Weight', 'Done'],
      sessionRows.map((row) => [
        String(row.Session),
        String(row.Date),
        String(row.Exercise),
        String(row.Set),
        String(row.Reps),
        String(row['Weight (kg)']),
        String(row.Completed),
      ]),
      y,
    )

    const planRows = buildPlanRows(options.plan)
    y = addTableSection(
      doc,
      'Weekly plan',
      ['Day', 'Muscle', 'Exercise', 'Sets', 'Reps', 'Weight'],
      planRows.map((row) => [
        String(row.Day),
        String(row['Muscle group']),
        String(row.Exercise),
        String(row.Sets),
        String(row.Reps),
        String(row['Weight (kg)'] ?? ''),
      ]),
      y,
    )
  }

  if (options.includeCalories) {
    const profileRows = buildNutritionProfileRows(options.nutritionProfile)
    if (profileRows.length > 0) {
      const profile = profileRows[0]
      y = addTableSection(
        doc,
        'Nutrition profile',
        ['Calories', 'Protein', 'Carbs', 'Fat', 'Goal'],
        [
          [
            String(profile['Daily calories']),
            String(profile['Protein (g)']),
            String(profile['Carbs (g)']),
            String(profile['Fat (g)']),
            String(profile.Goal),
          ],
        ],
        y,
      )
    } else {
      y = addTableSection(doc, 'Nutrition profile', ['Info'], [['Not set up']], y)
    }

    const logRows = buildCalorieLogRows(options.foodLogs)
    y = addTableSection(
      doc,
      'Food logs',
      ['Date', 'Meal', 'Food', 'Qty', 'Cal', 'P', 'C', 'F'],
      logRows.map((row) => [
        String(row.Date),
        String(row.Meal),
        String(row.Food),
        String(row['Quantity (g)']),
        String(row.Calories),
        String(row.Protein),
        String(row.Carbs),
        String(row.Fat),
      ]),
      y,
    )
  }

  doc.save(`onemorerep-export-${stamp}.pdf`)
}

export async function exportUserData(options: ExportOptions) {
  if (!options.includeWorkout && !options.includeCalories) {
    throw new Error('Select at least one data type to export')
  }

  if (options.format === 'excel') {
    const XLSX = await import('xlsx')
    exportExcel(options, XLSX)
    return
  }

  const { jsPDF } = await import('jspdf')
  exportPdf(options, jsPDF)
}
