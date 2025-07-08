import './App.css'
import {  BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Registration from './pages/Registration'
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
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
