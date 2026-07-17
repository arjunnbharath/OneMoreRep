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
import WorkoutDetail from './pages/WorkoutDetail'
import Tracker from './pages/Tracker'
import { CalorieTrackerPage } from './pages/CalorieTracker'
import Profile from './pages/Profile'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <PushNotificationSync />
      <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/muscle/:group" element={<MuscleGroupExercises />} />
          <Route path="/exercises" element={<ExerciseGuides />} />
          <Route path="/exercises/:id" element={<ExerciseDetail />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/calories" element={<CalorieTrackerPage />} />
          <Route path="/profile/*" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
