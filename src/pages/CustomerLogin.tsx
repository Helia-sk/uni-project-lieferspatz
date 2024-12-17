import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import AuthForm from '../components/AuthForm';
import { executeQuery } from '../db';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);


  const registerUserWithData = async (formData: any)=> {
    executeQuery(`INSERT INTO customers (username, first_name , last_name, street, postal_code, password_hash, balance)
      VALUES
    (?,?,?,?,?,?,?)`, [formData.username, formData.firstName, formData.lastName, formData.street, formData.postalCode, formData.password, 100]);

    const customers = executeQuery('SELECT * FROM customers');
    console.log("register user with data ", customers);
  }
  const loginWithData = async (formData: any)=> {
    const userIds = executeQuery(`SELECT id, first_name FROM customers WHERE username = ? AND password_hash= ?`, [formData.username,formData.password]);
    if (userIds.length>0){
      return true
    }
    return false
  }

  const handleSubmit = async (formData: any) => {
    // TODO: Implement actual authentication
    console.log('Customer auth:', formData);
    console.log(isLogin)
    if (!isLogin){
      registerUserWithData(formData)
      navigate('/');
    } 
    else {
      const isLoginSuccessful = await loginWithData(formData)
      if (isLoginSuccessful){
        navigate('/customer/dashboard');
      }
      else{
        alert("Please check your username and password")
      }
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