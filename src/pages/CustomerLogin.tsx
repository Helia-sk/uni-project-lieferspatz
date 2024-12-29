import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import AuthForm from '../components/AuthForm';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);


  const handleSubmit = async (formData: any) => {
    console.log('Customer auth:', formData);

    const endpoint = isLogin
      ? 'http://localhost:5050/api/customer/login'
      : 'http://localhost:5050/api/customer/register';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`${isLogin ? 'Login' : 'Registration'} successful`, data);
        navigate('/customer/dashboard'); // Redirect on success
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