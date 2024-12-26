import React, { useState } from 'react';

interface AuthFormProps {
  onSubmit: (data: any) => void;
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  type: 'restaurant' | 'customer';
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  isLogin,
  setIsLogin,
  type,
}) => {
  // Initialize dynamic formData state
  const [formData, setFormData] = useState(() => {
    if (isLogin) {
      return { username: '', password: '' }; // Only username and password for login
    } else if (type === 'restaurant') {
      return {
        username: '',
        password: '',
        name: '',
        description: '',
        street: '',
        postalCode: '',
      };
    } else {
      return {
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        street: '',
        postalCode: '',
      };
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
      <form className="mb-0 space-y-6" onSubmit={handleSubmit}>
        {/* Username field for both login and registration */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            onChange={handleChange}
          />
        </div>

        {!isLogin && type === 'restaurant' && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Restaurant Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                onChange={handleChange}
              />
            </div>
          </>
        )}

        {!isLogin && type === 'customer' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  onChange={handleChange}
                />
              </div>
            </div>
          </>
        )}

        {!isLogin && (
          <>
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                id="street"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal Code
              </label>
              <input
                type="text"
                name="postalCode"
                id="postalCode"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            onChange={handleChange}
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <button
          className="text-sm text-orange-600 hover:text-orange-500"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? `New ${type === 'restaurant' ? 'restaurant' : 'customer'}? Create an account`
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
