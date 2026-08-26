import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import PushNotificationSync from './components/PushNotificationSync'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Splash from './pages/Splash'
import ExerciseDetail from './pages/ExerciseDetail'
import ExerciseGuides from './pages/ExerciseGuides'
import MuscleGroupExercises from './pages/MuscleGroupExercises'
import Home from './pages/Home'
import WinterArc from './pages/WinterArc'
import WorkoutDetail from './pages/WorkoutDetail'
import TrackerRoute from './components/tracker/TrackerRoute'
import Profile from './pages/Profile'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Admin from './pages/Admin'

const CalorieTrackerPage = lazy(() =>
  import('./pages/CalorieTracker').then((m) => ({ default: m.CalorieTrackerPage })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <PushNotificationSync />
      <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/winter-arc" element={<WinterArc />} />
          <Route path="/muscle/:group" element={<MuscleGroupExercises />} />
          <Route path="/exercises" element={<ExerciseGuides />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/tracker/*" element={<TrackerRoute />} />
          <Route
            path="/calories"
            element={
              <Suspense fallback={<PageLoader />}>
                <CalorieTrackerPage />
              </Suspense>
            }
          />
          <Route path="/profile/*" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
