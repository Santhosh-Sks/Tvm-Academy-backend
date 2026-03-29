import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetails from './components/CourseDetails';
import Enquiry from './pages/Enquiry';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordReset from './pages/PasswordReset';
import Dashboard from './pages/Dashboard';
import ManageCourses from './pages/ManageCourses';
import ViewEnquiries from './pages/ViewEnquiries';
import MyCourses from './pages/MyCourses';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import ManageStudentProgress from './pages/ManageStudentProgress';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar user={user} logout={logout} />
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:id" element={<CourseDetails />} />
            <Route path="/enquiry" element={<Enquiry />} />
            <Route path="/payment/:token" element={<Payment />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/my-courses" element={
              user && user.role === 'user' ? <MyCourses /> : <Navigate to="/login" />
            } />
            <Route path="/dashboard" element={
              user && user.role === 'admin' ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="/manage-courses" element={
              user && user.role === 'admin' ? <ManageCourses /> : <Navigate to="/login" />
            } />
            <Route path="/view-enquiries" element={
              user && user.role === 'admin' ? <ViewEnquiries /> : <Navigate to="/login" />
            } />
            <Route path="/reports" element={
              user && user.role === 'admin' ? <Reports /> : <Navigate to="/login" />
            } />
            <Route path="/manage-progress" element={
              user && user.role === 'admin' ? <ManageStudentProgress /> : <Navigate to="/login" />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
