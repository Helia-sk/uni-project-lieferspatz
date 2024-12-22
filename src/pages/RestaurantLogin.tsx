import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import AuthForm from '../components/AuthForm';

const RestaurantLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: any) => {
    console.log('Restaurant auth:', formData);

    const endpoint = isLogin
      ? 'http://127.0.0.1:5000/api/login'
      : 'http://127.0.0.1:5000/api/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${isLogin ? 'Login' : 'Registration'} successful`, data);
        navigate('/restaurant/dashboard'); // Redirect on success
      } else {
        const errorData = await response.json();
        console.error(`${isLogin ? 'Login' : 'Registration'} failed:`, errorData);
        alert(errorData.error || `${isLogin ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error during authentication');
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
