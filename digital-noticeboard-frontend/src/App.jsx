import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import DisplayBoard from "./components/DisplayBoard";
import AdminLogin from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(savedAuth === "true");
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>; 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DisplayBoard />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/login"
          element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Unknown path → redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
