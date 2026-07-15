/** Local calendar backgrounds — one per month (0 = January). */
const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const calendarMonthImages: Record<number, { image: string; label: string }> =
  Object.fromEntries(
    MONTHS.map((month, index) => [
      index,
      {
        label: MONTH_LABELS[index],
        image: `/images/calendar/${month}.jpg`,
      },
    ]),
  )

export function getMonthBackground(month: Date) {
  return calendarMonthImages[month.getMonth()] ?? calendarMonthImages[0]
}
