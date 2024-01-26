import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Technology from './pages/Technology'

function App() {

  return (
    <div>
      <Routes>
        <Route index element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/technology/:name" element={<Technology />} />
      </Routes>
    </div>
  )
}

export default App
