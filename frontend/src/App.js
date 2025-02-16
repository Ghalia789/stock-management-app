import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container , ThemeProvider, CssBaseline } from '@mui/material';
import AuthProvider from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import theme from './theme'; 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <AuthProvider>
      <Router>
        <Container maxWidth="lg">
          <Routes>
            {/* Redirect root path to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;