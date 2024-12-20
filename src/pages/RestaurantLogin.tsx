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
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          street: formData.street,
          postalCode: formData.postalCode,
          description: formData.description,
        }),
      });
  
      if (response.ok) {
        console.log('Registration successful');
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error during registration:', errorData);
        alert(errorData.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error during registration');
      return false;
    }
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