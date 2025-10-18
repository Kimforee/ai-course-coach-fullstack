import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './routes/Dashboard'
import CourseDetails from './routes/CourseDetails'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Codingal AI Course Coach</h1>
            <nav className="text-sm">
              <Link to="/" className="underline">Dashboard</Link>
            </nav>
          </header>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course/:courseId" element={<CourseDetails />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}