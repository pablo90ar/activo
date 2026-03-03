import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Home'
import Diagnostic from './Diagnostic'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
      </Routes>
    </Router>
  )
}

export default App
