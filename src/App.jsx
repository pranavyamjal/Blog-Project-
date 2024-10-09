import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';
import authService from "./appwrite/auth";
import { login, logout } from "./store/authSlice";
import { Footer, Header } from './components';
import { Outlet } from 'react-router-dom';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for current user on initial load
    authService.getCurrentUser()
      .then((userData) => {
        if (userData) {
          // Dispatch the raw userData, not wrapped in an object
          dispatch(login(userData));
        } else {
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error("Failed to authenticate user:", error);
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  return !loading ? (
    <div className='min-h-screen flex flex-wrap content-between bg-gray-400'>
      <div className='w-full block'>
        <Header />
        <main>
            <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  ) : null;
}

export default App;
