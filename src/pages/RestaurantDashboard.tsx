import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RestaurantNav from '../components/restaurant/RestaurantNav';
import Profile from '../components/restaurant/Profile';
import Menu from '../components/restaurant/Menu';
import Orders from '../components/restaurant/Orders';
import OrderHistory from '../components/restaurant/OrderHistory';
import Settings from '../components/restaurant/Settings';

const RestaurantDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <RestaurantNav />
      <div className="mt-6">
        <Routes>
          <Route path="/" element={<Orders />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/history" element={<OrderHistory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default RestaurantDashboard;