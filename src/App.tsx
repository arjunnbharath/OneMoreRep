import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Splash from './pages/Splash'
import Home from './pages/Home'
import WorkoutDetail from './pages/WorkoutDetail'
import Tracker from './pages/Tracker'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
        <Route path="/tracker" element={<Tracker />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
