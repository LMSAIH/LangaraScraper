import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Registration from './pages/Registration'
import CoursePage from './pages/CoursePage'
import CoursesPage from './pages/CoursesPage'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
          <Navbar />
          <Routes>
            <Route path="/" element={<Registration />} />
            <Route path='/courses' element={<CoursesPage />} />
            <Route path='/courses/:courseCode' element={<CoursePage />} />

          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
