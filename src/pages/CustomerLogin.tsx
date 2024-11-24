import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import AuthForm from '../components/AuthForm';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: any) => {
    // TODO: Implement actual authentication
    console.log('Customer auth:', formData);
    navigate('/customer/dashboard');
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