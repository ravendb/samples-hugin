import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'

function App() {

  return (
    <div>
      <Routes>
        <Route index element={<Navigate replace to="/home" />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
  )
}

export default App
