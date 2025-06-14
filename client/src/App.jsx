import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "./components/Layout"
import StudentsTable from "./pages/StudentsTable"
import StudentProfile from "./pages/StudentProfile"
import Settings from "./pages/Settings"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<StudentsTable />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
