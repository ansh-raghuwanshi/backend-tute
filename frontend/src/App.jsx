import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { login, logout } from './store/authSlice';
import api from './api/axios';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoDetail from './pages/VideoDetail';
import ChannelProfile from './pages/ChannelProfile';
import Dashboard from './pages/Dashboard';
import LikedVideos from './pages/LikedVideos';
import History from './pages/History';
import Subscriptions from './pages/Subscriptions';

function ProtectedRoute({ children }) {
  const { status } = useSelector((state) => state.auth);
  if (!status) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/get-user');
        if (response.data?.data) {
          dispatch(login(response.data.data));
        }
      } catch (error) {
        dispatch(logout());
      }
    };
    fetchUser();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Toaster position="top-right" />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/video/:id" element={<VideoDetail />} />
          <Route path="/channel/:username" element={<ChannelProfile />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/liked-videos" 
            element={
              <ProtectedRoute>
                <LikedVideos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subscriptions" 
            element={
              <ProtectedRoute>
                <Subscriptions />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
