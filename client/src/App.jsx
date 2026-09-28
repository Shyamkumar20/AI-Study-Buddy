import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

// Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Materials } from "./pages/Materials";
import { MaterialDetail } from "./pages/MaterialDetail";
import { StudyPlan } from "./pages/StudyPlan";
import { Tasks } from "./pages/Tasks";
import { Quiz } from "./pages/Quiz";
import { AIAssistant } from "./pages/AIAssistant";
import { Progress } from "./pages/Progress";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="materials" element={<Materials />} />
              <Route path="materials/:id" element={<MaterialDetail />} />
              <Route path="study-plan" element={<StudyPlan />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="quizzes" element={<Quiz />} />
              <Route path="chat" element={<AIAssistant />} />
              <Route path="progress" element={<Progress />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />

              {/* Admin only route */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
