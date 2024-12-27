import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import apiClient from '../api';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: any) => {
    console.log('Restaurant auth:', formData);

    const endpoint = isLogin ? '/api/login' : '/api/register';


    try {
      const response = await apiClient.post(endpoint, formData); // Use Axios for the request

      if (response.status === 200) {
        console.log(`${isLogin ? 'Login' : 'Registration'} successful`, response.data);
        navigate('/restaurant/dashboard'); // Redirect on success
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('Failed to authenticate. Please try again.');
    }
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
