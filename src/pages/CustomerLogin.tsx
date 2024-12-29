import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import apiClient from '../api';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: any) => {
    console.log('Customer auth:', formData);

    const endpoint = isLogin ? '/api/customer/login' : '/api/customer/register';
    

    try {
      const response = await apiClient.post(endpoint, formData);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`${isLogin ? 'Login' : 'Registration'} successful`, response.data);
        navigate('/customer/dashboard'); // Redirect on success
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('Failed to authenticate. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Users className="mx-auto h-12 w-12 text-orange-500" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          {isLogin ? 'Customer Login' : 'Create Account'}
        </h2>
      </div>

      <AuthForm
        onSubmit={handleSubmit}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        type="customer"
      />
    </div>
  );
};

export default CustomerLogin;