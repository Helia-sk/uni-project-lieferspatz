import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RestaurantList from '../components/customer/RestaurantList';
import RestaurantDetails from '../components/customer/RestaurantDetails';
import Cart from '../components/customer/Cart';
import OrderHistory from '../components/customer/OrderHistory';
import CustomerNav from '../components/customer/CustomerNav';
import Balance from '../components/customer/Balance';

const CustomerDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <CustomerNav />
      <div className="mt-6">
        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/balance" element={<Balance />} />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerDashboard;