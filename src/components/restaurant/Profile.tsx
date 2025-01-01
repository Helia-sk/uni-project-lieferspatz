import React, { useState, useEffect } from 'react';
import type { Restaurant } from '../../db/schema';
import ImageUpload from '../ImageUpload';
import apiClient from '../../api'; 

const Profile = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await apiClient.get('/api/restaurant');
        setRestaurant(response.data);
      } catch (error) {
        console.error('Failed to fetch restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
    setLoading(false);
  }, []);

  const handleImageUpload = async (file: File) => {
    // TODO: Handle image upload
    console.log('Uploading image:', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
  
    const updatedData = {
      id: restaurant?.id ?? 0,
      name: (document.getElementById('name') as HTMLInputElement).value,
      description: (document.getElementById('description') as HTMLTextAreaElement).value,
      street: (document.getElementById('street') as HTMLInputElement).value,
      postalCode: (document.getElementById('postalCode') as HTMLInputElement).value,
      imageUrl: restaurant?.imageUrl, // Assume the image URL is already set or uploaded
      passwordHash: restaurant?.passwordHash ?? '',
      balance: restaurant?.balance ?? 0,
    };
  
    try {
      const response = await apiClient.put('/api/restaurant', updatedData);
      if (response.status === 200) {
        console.log('Restaurant updated successfully:', response.data);
        setRestaurant({ ...restaurant, ...updatedData });
        setError(null);
      } else {
        throw new Error('Failed to update restaurant');
      }
    } catch (error) {
      console.error('Failed to update restaurant:', error);
      setError('Failed to update restaurant');
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="space-y-6">
              {/* Restaurant Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Image
                </label>
                <ImageUpload
                  imageUrl={restaurant?.imageUrl}
                  onImageUpload={handleImageUpload}
                  className="h-48 w-full"
                />
              </div>

              {/* Restaurant Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  defaultValue={restaurant?.name}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  defaultValue={restaurant?.description}
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  id="street"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  defaultValue={restaurant?.street}
                />
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  defaultValue={restaurant?.postalCode}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;