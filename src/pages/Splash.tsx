import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { heroImage } from '../data/mockData'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-dvh">
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

      <div className="relative flex min-h-dvh flex-col justify-end px-6 pb-10 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-lg lg:max-w-2xl lg:text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/60">
            OneMoreRep
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Workout for health
          </h1>
          <p className="mt-4 text-base text-white/80 sm:text-lg lg:mx-auto lg:max-w-xl">
            Thousands of fitness classes, gyms, and wellness, all in one app.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-lg">
          <Button
            variant="secondary"
            fullWidth
            className="py-4 text-base font-bold"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
