import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import apiClient from '../../api'; 

const Balance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await apiClient.get('/api/customer/balance'); 
      const { balance } = response.data;
  
      if (balance !== undefined) {
        setBalance(parseFloat(balance)); // Set balance from API response
      } else {
        setError('Balance data not found');
      }
  
      setError(null);
    } catch (err) {
      console.error('Failed to load balance:', err);
      setError('Failed to load balance');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Balance</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Wallet className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Current Balance</p>
                <p className="text-3xl font-bold text-gray-900">€{balance.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Balance;