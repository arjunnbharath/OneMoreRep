import { useNavigate } from 'react-router-dom'
import { exerciseGroups } from '../../data/exerciseGuides'

export default function MuscleExerciseList() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-2 gap-3">
      {exerciseGroups.map((group) => (
        <button
          key={group.id}
          type="button"
          onClick={() => navigate(`/muscle/${group.id}`)}
          className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-surface text-left ring-1 ring-border"
        >
          <img
            src={group.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
          <div className="relative flex h-full flex-col justify-end p-3">
            <p className="text-sm font-semibold leading-tight text-white">{group.label}</p>
            <p className="mt-0.5 text-[11px] text-white/65">
              {group.count} exercise{group.count === 1 ? '' : 's'}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
