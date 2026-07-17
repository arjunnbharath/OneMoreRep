import { useMemo, useState } from 'react'
import { Calendar, Check, ChevronRight, Dumbbell, Flame, Heart, Weight } from 'lucide-react'
import GeminiSelectCard from '../ui/GeminiSelectCard'
import {
  buildPlanFromAnswers,
  SPLIT_DESCRIPTIONS,
  SPLIT_LABELS,
} from '../../lib/planSplitBuilder'
import type {
  PlanOnboardingAnswers,
  SplitType,
  TrainingDays,
  TrainingExperience,
  TrainingGoal,
} from '../../types/workoutPreferences'
import type { WeeklyPlan } from '../../types/workoutPlan'

const ONBOARDING_BG = '/images/gym_background/workout history.jpg'

const DAY_OPTIONS: { value: TrainingDays; hint: string }[] = [
  { value: 3, hint: 'Light' },
  { value: 4, hint: 'Balanced' },
  { value: 5, hint: 'Dedicated' },
  { value: 6, hint: 'Max' },
]

const DAY_QUOTES: Record<TrainingDays, string> = {
  3: 'Three focused sessions beat seven rushed ones. Consistency is the real flex.',
  4: 'Four days hits the sweet spot — enough volume to grow, enough rest to recover.',
  5: 'Five days keeps momentum high. Most lifters thrive right here.',
  6: 'Six days takes commitment. We’ll build a split that respects recovery.',
}

interface PlanOnboardingProps {
  onComplete: (plan: WeeklyPlan, answers: PlanOnboardingAnswers, splitType: SplitType) => void
  onSkip: () => void
}

const EXPERIENCE_OPTIONS: { value: TrainingExperience; label: string; hint: string }[] = [
  { value: 'new', label: 'Just starting', hint: 'Never or barely trained' },
  { value: 'under_1y', label: 'Under 1 year', hint: 'Still building habits' },
  { value: '1_3y', label: '1–3 years', hint: 'Consistent training' },
  { value: '3plus', label: '3+ years', hint: 'Experienced lifter' },
]

const GOAL_OPTIONS: {
  value: TrainingGoal
  label: string
  hint: string
  icon: typeof Dumbbell
}[] = [
  { value: 'muscle', label: 'Build muscle', hint: 'Hypertrophy & volume', icon: Dumbbell },
  { value: 'strength', label: 'Get stronger', hint: 'Strength & power', icon: Weight },
  { value: 'fat_loss', label: 'Lose fat / fitness', hint: 'Conditioning & tone', icon: Flame },
  { value: 'general', label: 'A bit of everything', hint: 'Flexible, balanced training', icon: Heart },
]

function DayOptionButton({
  value,
  hint,
  selected,
  onClick,
}: {
  value: TrainingDays
  hint: string
  selected: boolean
  onClick: () => void
}) {
  const display = value === 6 ? '6+' : String(value)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-1 flex-col items-center gap-2.5 py-1 transition"
    >
      {selected ? (
        <div className="onboarding-day-glow rounded-full p-[2.5px]">
          <div className="onboarding-day-selected-inner flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-surface text-2xl font-bold tabular-nums text-foreground dark:bg-background">
            {display}
          </div>
        </div>
      ) : (
        <div className="onboarding-day-circle flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-surface text-2xl font-bold tabular-nums text-foreground ring-1 ring-border transition group-hover:ring-foreground/25">
          {display}
        </div>
      )}
      <div className="text-center">
        <p
          className={[
            'text-[11px] font-semibold uppercase tracking-wide',
            selected ? 'onboarding-quote-gradient' : 'text-muted',
          ].join(' ')}
        >
          {hint}
        </p>
        <p className="mt-0.5 text-[10px] text-muted">per week</p>
      </div>
    </button>
  )
}

function GoalOptionButton({
  label,
  hint,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string
  hint: string
  icon: typeof Dumbbell
  selected: boolean
  onClick: () => void
}) {
  return (
    <GeminiSelectCard selected={selected} onClick={onClick} innerClassName="flex items-center gap-3 px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-muted ring-1 ring-border dark:bg-surface">
        <Icon size={17} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{hint}</p>
      </div>
      {selected ? (
        <div className="onboarding-day-glow shrink-0 rounded-full p-[2px]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface dark:bg-background">
            <Check size={11} className="text-foreground" strokeWidth={3} />
          </div>
        </div>
      ) : (
        <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border bg-transparent" />
      )}
    </GeminiSelectCard>
  )
}

function OptionButton({
  selected,
  onClick,
  children,
  hint,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  hint?: string
}) {
  return (
    <GeminiSelectCard selected={selected} onClick={onClick} innerClassName="px-4 py-3.5">
      <span className="block text-sm font-medium text-foreground">{children}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </GeminiSelectCard>
  )
}

export default function PlanOnboarding({ onComplete, onSkip }: PlanOnboardingProps) {
  const [step, setStep] = useState(0)
  const [daysPerWeek, setDaysPerWeek] = useState<TrainingDays | null>(null)
  const [experience, setExperience] = useState<TrainingExperience | null>(null)
  const [goal, setGoal] = useState<TrainingGoal | null>(null)

  const preview = useMemo(() => {
    if (!daysPerWeek || !experience || !goal) return null
    return buildPlanFromAnswers({ daysPerWeek, experience, goal })
  }, [daysPerWeek, experience, goal])

  function handleNext() {
    if (step < 2) {
      setStep((s) => s + 1)
      return
    }
    if (!daysPerWeek || !experience || !goal || !preview) return
    onComplete(preview.plan, { daysPerWeek, experience, goal }, preview.splitType)
  }

  const canContinue =
    (step === 0 && daysPerWeek !== null) ||
    (step === 1 && experience !== null) ||
    (step === 2 && goal !== null && preview !== null)

  return (
    <div className="mx-auto max-w-lg py-2 lg:max-w-xl">
      <div className="onboarding-card overflow-hidden rounded-3xl ring-1 ring-border">
        <div className="relative h-44 lg:h-52">
          <img
            src={ONBOARDING_BG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="onboarding-hero-overlay pointer-events-none absolute inset-0" />
          <div className="absolute inset-0 flex items-end p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                <Dumbbell size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow-sm">Set up your split</h2>
                <p className="text-xs text-white/80 drop-shadow-sm">
                  Step {step + 1} of 3 · we&apos;ll build your week
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="onboarding-body px-5 pb-5 pt-4">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={[
                  'h-1 flex-1 rounded-full transition',
                  i <= step ? 'bg-foreground' : 'bg-border',
                ].join(' ')}
              />
            ))}
          </div>

          <div className="mt-5 min-h-[320px] flex flex-col lg:min-h-[340px]">
            {step === 0 && (
              <div className="flex flex-1 flex-col">
                <p className="text-sm text-muted">How many days a week can you train?</p>
                <div className="mt-5 flex justify-between gap-2 px-1">
                  {DAY_OPTIONS.map((option) => (
                    <DayOptionButton
                      key={option.value}
                      value={option.value}
                      hint={option.hint}
                      selected={daysPerWeek === option.value}
                      onClick={() => setDaysPerWeek(option.value)}
                    />
                  ))}
                </div>

                <div className="flex flex-1 items-center justify-center px-3 py-6">
                  {daysPerWeek ? (
                    <p className="onboarding-split-quote max-w-[20rem] text-center text-sm">
                      &ldquo;{DAY_QUOTES[daysPerWeek]}&rdquo;
                    </p>
                  ) : (
                    <p className="text-center text-xs text-muted/60">Pick a number to continue</p>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted">
                  How long have you been training consistently?
                </p>
                <div className="space-y-2">
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <OptionButton
                      key={option.value}
                      selected={experience === option.value}
                      onClick={() => setExperience(option.value)}
                      hint={option.hint}
                    >
                      {option.label}
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted">What&apos;s your main goal?</p>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map((option) => (
                    <GoalOptionButton
                      key={option.value}
                      label={option.label}
                      hint={option.hint}
                      icon={option.icon}
                      selected={goal === option.value}
                      onClick={() => setGoal(option.value)}
                    />
                  ))}
                </div>

                {preview && (
                  <div className="onboarding-panel mt-4 rounded-2xl px-4 py-3.5 ring-1 ring-border">
                    <div className="flex items-start gap-2.5">
                      <Calendar size={16} className="mt-0.5 shrink-0 text-muted" />
                      <div>
                        <p className="text-sm font-medium">{SPLIT_LABELS[preview.splitType]}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {SPLIT_DESCRIPTIONS[preview.splitType]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto flex items-center gap-3 pt-5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted transition hover:text-foreground"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className={[
                  'flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-sm font-medium text-background transition disabled:opacity-40',
                  step === 0 ? 'ml-auto w-full justify-center' : 'ml-auto',
                ].join(' ')}
              >
                {step === 2 ? 'Create plan' : 'Continue'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 w-full py-2 text-center text-sm text-muted transition hover:text-foreground"
      >
        Set up manually
      </button>
    </div>
  )
}
