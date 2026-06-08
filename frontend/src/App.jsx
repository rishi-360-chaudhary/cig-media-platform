import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import {io} from 'socket.io-client';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventGallery from './pages/EventGallery';
import FindMe from './pages/FindMe';

const ProtectedRoute = ({children}) => {
  const user = localStorage.getItem('user');
  if(!user)return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({children}) => {
  const user = localStorage.getItem('user');
  if(user)return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL,{
      withCredentials: true
    });

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try{
        const user = JSON.parse(storedUser);
        const userId = user._id || user.id; 
        if(userId){
          socket.emit('joinUserRoom',userId);
        }
      } 
      catch(err) {
        console.error("Could not parse user for socket connection",err);
      }
    }

  socket.on('notification', (data) => {
    console.log("Real-time event received:", data);
    setNotification(data);

    setTimeout(() => {
      setNotification(null);
    }, 5000);
  });

  return () => {
    socket.disconnect();
  };
  
  },[]);

  return (
    <BrowserRouter>

      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white pr-6 pl-4 py-3 rounded-xl shadow-2xl border-l-4 border-blue-500 flex items-center gap-4 transition-all duration-300 transform translate-y-0 opacity-100 hover:bg-gray-700">
          
          <Link 
            to={`/gallery/${notification.eventId}`} 
            onClick={() => setNotification(null)}
            className="flex-1 flex items-center gap-4 cursor-pointer"
          >
            {notification.photoUrl && (
              <img 
                src={notification.photoUrl} 
                alt="Notification thumbnail" 
                className="w-12 h-12 rounded-lg object-cover border border-gray-600 shadow-sm"
              />
            )}
            
            <div>
              <p className="font-bold text-blue-400">
                {notification.type === 'LIKE' ? '❤️ New Like' : '💬 New Comment'}
              </p>
              <p className="text-sm text-gray-300">{notification.message}</p>
            </div>
          </Link>

          {/* close button */}
          <button 
            onClick={() => setNotification(null)} 
            className="text-gray-500 hover:text-white text-2xl font-bold ml-2 focus:outline-none"
          >
            &times;
          </button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/gallery/:eventId" element={<ProtectedRoute><EventGallery /></ProtectedRoute>} />
        <Route path="/find-me" element={<ProtectedRoute><FindMe /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;