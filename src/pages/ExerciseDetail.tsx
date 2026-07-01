import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell, Lightbulb, ListOrdered, Video } from 'lucide-react'
import ExerciseVideoPlayer from '../components/ExerciseVideoPlayer'
import Button from '../components/Button'
import { exerciseGroupLabels, getExerciseById } from '../data/exerciseGuides'
import { findVideoForExercise, workoutVideoCategories } from '../data/workoutVideos'

export default function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const exercise = getExerciseById(id ?? '')
  const video = useMemo(
    () => (exercise ? findVideoForExercise(exercise.name) : null),
    [exercise],
  )

  if (!exercise) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-background px-5 text-foreground">
        <p className="font-semibold">Exercise not found</p>
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="mt-4 text-sm text-foreground underline-offset-2 hover:underline"
        >
          Back to guides
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="relative h-64 lg:h-80">
        {video?.available ? (
          <ExerciseVideoPlayer
            src={video.videoPath}
            poster={exercise.image}
            title={exercise.name}
            className="h-full"
          />
        ) : (
          <img src={exercise.image} alt="" className="h-full w-full object-cover" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <button
          type="button"
          onClick={() => navigate('/exercises')}
          className="absolute left-5 top-6 flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-foreground backdrop-blur transition hover:bg-background"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="px-5 pb-10 lg:px-10">
        <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold">
          {exerciseGroupLabels[exercise.group]}
        </span>
        <h1 className="mt-3 text-2xl font-bold lg:text-3xl">{exercise.name}</h1>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <Dumbbell size={14} />
          {exercise.equipment}
        </p>
        {video?.available ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted">
            <Video size={14} />
            Demo playing — {video.label}
          </p>
        ) : workoutVideoCategories.length === 0 ? (
          <p className="mt-2 text-xs text-muted">
            Run npm run prepare:videos to load exercise demo videos.
          </p>
        ) : null}
        <p className="mt-4 leading-relaxed text-muted">{exercise.description}</p>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ListOrdered size={18} />
            How to perform
          </h2>
          <ol className="mt-4 space-y-3">
            {exercise.steps.map((step, i) => (
              <li
                key={step}
                className="flex gap-3 rounded-2xl bg-surface p-4 ring-1 ring-border"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lightbulb size={18} />
            Tips
          </h2>
          <ul className="mt-4 space-y-2">
            {exercise.tips.map((tip) => (
              <li
                key={tip}
                className="rounded-xl bg-surface px-4 py-3 text-sm text-muted ring-1 ring-border"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <Button fullWidth className="mt-8 py-3.5" onClick={() => navigate('/tracker')}>
          Log this exercise
        </Button>
      </div>
    </div>
  )
}
