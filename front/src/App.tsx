import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Diagnostic from "./Diagnostic";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diagnostic" element={<Diagnostic />} />
      </Routes>
    </Router>
  );
}

export default App;
