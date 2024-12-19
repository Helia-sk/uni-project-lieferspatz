import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { executeQuery } from '../db';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: any) => {
    console.log('Restaurant auth:', formData);

    if (!isLogin) {
      console.log("registration");
      // Handle restaurant registration
      await registerRestaurantWithData(formData); 
      navigate('/restaurant/dashboard');
      
    } else {
      // Handle restaurant login
      const isLoginSuccessful = await loginWithData(formData);
      if (isLoginSuccessful) {
        navigate('/restaurant/dashboard');
      } else {
        alert("Invalid username or password. Please try again.");
      }
    }
  };

  const registerRestaurantWithData = async (formData: any) => {
    console.log("registerRestaurantWithData", formData);
    // Insert restaurant details into the database
    await executeQuery(
      `INSERT INTO restaurants (username, name,street,postal_code, description, password_hash, balance)
      VALUES (?, ?, ?, ?, ?,?,?)`,
      [formData.username, formData.name,formData.street, formData.postalCode, formData.description, formData.password, 100  ]
    );

    const restaurants = await executeQuery('SELECT * FROM restaurants');
    console.log("Registered restaurant with data:", restaurants);
  };

  const loginWithData = async (formData: any) => {
    // Query database for restaurant credentials
    const restaurantIds = await executeQuery(
      `SELECT id, username FROM restaurants WHERE username = ? AND password_hash = ?`,
      [formData.username, formData.password]
    );

    if (restaurantIds.length > 0) {
      console.log("Login successful for restaurant:", restaurantIds[0]);
      return true;
    }
    return false;
  };


  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <ChefHat className="mx-auto h-12 w-12 text-orange-500" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          {isLogin ? 'Restaurant Login' : 'Register Restaurant'}
        </h2>
      </div>

      <AuthForm
        onSubmit={handleSubmit}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        type="restaurant"
      />
    </div>
  );
};

export default RestaurantLogin;