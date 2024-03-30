// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // 导入 Routes
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';


const App = () => {
  return (
    <Router>
      <Routes> {/* 使用 <Routes> 包裹 */}
        <Route exact path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;
