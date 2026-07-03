import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Dashboard/Sidebar'
import RightPanel from './components/Dashboard/RightPanel'
import DashboardPage from './pages/DashboardPage'
import LessonsPage from './pages/LessonsPage'
import StudentsPage from './pages/StudentsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { addMonths } from './lib/date'
import { initializeDemoStudents } from './data/initialStudents'
import { initializeTeacher } from './lib/teacherStore'
import { getCurrentUserId } from './lib/auth'
import { migrateUserData, wasMigrated, markMigrationDone } from './lib/migrateData'

function MainLayout() {
  // Initialize teacher profile on mount
  useEffect(() => {
    initializeTeacher()
  }, [])

  // Migrate old data to new format with userId
  useEffect(() => {
    const userId = getCurrentUserId()
    if (userId && !wasMigrated(userId)) {
      console.log('🔄 First login after update - migrating data...')
      migrateUserData()
      markMigrationDone(userId)
    }
  }, [])
  const [today] = useState(() => new Date())
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(today)

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  return (
    <div className="flex min-h-screen flex-col bg-white lg:h-screen lg:flex-row lg:overflow-hidden">
      <Sidebar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/lessons" element={<LessonsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
          <Route path="/homework" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Homework (Coming Soon)</h1></div>} />
          <Route path="/paid-courses" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Paid Courses (Coming Soon)</h1></div>} />
          <Route path="/attendance" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Attendance (Coming Soon)</h1></div>} />
          <Route path="/duties" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Duties (Coming Soon)</h1></div>} />
          <Route path="/grading" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Grading (Coming Soon)</h1></div>} />
          <Route path="/alumni" element={<div className="flex-1 p-8"><h1 className="text-2xl font-bold text-[#1D3557]">Alumni (Coming Soon)</h1></div>} />
      </Routes>
      <RightPanel
        month={month}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onPrevMonth={() => setMonth((current) => addMonths(current, -1))}
        onNextMonth={() => setMonth((current) => addMonths(current, 1))}
      />
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize demo students on first load
    initializeDemoStudents()
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/*" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
