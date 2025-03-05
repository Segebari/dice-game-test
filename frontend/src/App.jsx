import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes"; 
import Auth from "./Auth";
import Dice from "./Dice";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dice />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}


export default App;
