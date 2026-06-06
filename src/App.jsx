import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';
import Rooms from './pages/Rooms';
import FriendsPage from './pages/FriendsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/chat" element={<ChatRoom />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/friends" element={<FriendsPage />} />
    </Routes>
  );
}

export default App;
