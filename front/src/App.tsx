import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./hooks/useSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Diagnostic from "./pages/Diagnostic";
import Trainee from "./pages/Trainee";
import Routines from "./pages/Routines";
import Exercises from "./pages/Exercises";
import Training from "./pages/Training";
import History from "./pages/History";
import Settings from "./pages/Settings";
import ExerciseTags from "./pages/ExerciseTags";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <SettingsProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/diagnostic" element={<Diagnostic />} />
                <Route path="/trainees" element={<Trainee />} />
                <Route path="/routines" element={<Routines />} />
                <Route path="/exercises" element={<Exercises />} />
                <Route path="/tags" element={<ExerciseTags />} />
                <Route path="/training" element={<Training />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </SettingsProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
