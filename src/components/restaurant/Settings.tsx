import React, { useState, useEffect } from 'react';
import apiClient from '../../api'; 
type OpeningHour = {
  id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
};

type DeliveryArea = {
  id: number;
  postal_code: string;
};

const Settings = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [newHourData, setNewHourData] = useState<OpeningHour>({
    id: 0,
    day_of_week: 0,
    open_time: '',
    close_time: '',
  });
  const [newPostalCode, setNewPostalCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [openingHoursResponse, deliveryAreasResponse] = await Promise.all([
          apiClient.get('/api/settings/opening_hours'),
          apiClient.get('/api/settings/delivery_areas'),
        ]);

        setOpeningHours(openingHoursResponse.data);
        setDeliveryAreas(deliveryAreasResponse.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddOrUpdateHour = () => {
    if (!newHourData.open_time || !newHourData.close_time) {
      setError('Please provide valid opening and closing times.');
      return;
    }

    const existingIndex = openingHours.findIndex(
      (hour) => hour.day_of_week === newHourData.day_of_week
    );

    if (existingIndex !== -1) {
      const updatedHours = [...openingHours];
      updatedHours[existingIndex] = { ...newHourData, id: openingHours[existingIndex].id };
      setOpeningHours(updatedHours);
    } else {
      setOpeningHours((prev) => [
        ...prev,
        { ...newHourData, id: Math.max(0, ...prev.map((hour) => hour.id)) + 1 },
      ]);
    }

    setNewHourData({ id: 0, day_of_week: 0, open_time: '', close_time: '' });
    setError(null);
  };

  const handleRemoveHour = (id: number) => {
    setOpeningHours((prev) => prev.filter((hour) => hour.id !== id));
  };

  const handleAddPostalCode = async () => {
    if (!newPostalCode) {
      setError('Please provide a valid postal code.');
      return;
    }

    try {
      const response = await apiClient.post('/api/settings/delivery_areas', {
        postal_code: newPostalCode,
      });

      setDeliveryAreas((prev) => [...prev, response.data]);
      setNewPostalCode('');
      setError(null);
    } catch (error) {
      console.error('Failed to add postal code:', error);
      setError('Postal Code already exists');
    }
  };

  const handleDeletePostalCode = async (id: number) => {
    try {
      const response = await apiClient.delete(`/api/settings/delivery_areas/${id}`);
      if (response.status === 200) {
        setDeliveryAreas((prev) => prev.filter((area) => area.id !== id));
        setError(null);
      }
    } catch (error) {
      console.error('Failed to delete postal code:', error);
      setError('Cannot delete this postal code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await apiClient.post('/api/settings/opening_hours/batch_update', {
        opening_hours: openingHours,
      });

      if (response.status !== 200) {
        throw new Error('Failed to save settings.');
      }

      console.log('Settings updated successfully:', response.data);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings.');
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opening Hours */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 relative">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Opening Hours</h2>
            {/* Info Icon */}
            <div className="absolute top-4 right-4 z-10">
              <div className="group relative flex items-center cursor-pointer">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
                  i
                </span>
                <div className="absolute hidden group-hover:block bg-gray-700 text-white text-sm rounded-lg py-2 px-4 shadow-lg left-1/2 transform -translate-x-2/3 mt-10 w-100">
                  00:00 means closed
                </div>
              </div>
            </div>
            {/* End Info Icon */}

            <div className="flex items-center space-x-4">
              <label>
                Day of the Week:
                <select
                  value={newHourData.day_of_week}
                  onChange={(e) =>
                    setNewHourData({ ...newHourData, day_of_week: Number(e.target.value) })
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                    (day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Open Time:
                <input
                  type="time"
                  value={newHourData.open_time}
                  onChange={(e) =>
                    setNewHourData({ ...newHourData, open_time: e.target.value })
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </label>

              <label>
                Close Time:
                <input
                  type="time"
                  value={newHourData.close_time}
                  onChange={(e) =>
                    setNewHourData({ ...newHourData, close_time: e.target.value })
                  }
                  className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </label>

              <button
                type="button"
                onClick={handleAddOrUpdateHour}
                className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Add
              </button>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-4">
            {openingHours.map((hour) => (
              <div
                key={hour.id}
                className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg shadow"
              >
                <span>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                    hour.day_of_week
                  ]}{' '}
                  :{' '}
                  {hour.open_time === '00:00' && hour.close_time === '00:00' ? (
                    <span className="text-red-500 font-medium">Closed</span>
                  ) : (
                    `${hour.open_time} - ${hour.close_time}`
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveHour(hour.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Changes Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {saving ? 'Saving...' : 'Submit Changes'}
          </button>
        </div>

        {/* Delivery Areas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Delivery Areas</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Add postal code"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  value={newPostalCode}
                  onChange={(e) => setNewPostalCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddPostalCode}
                  className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {deliveryAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span className="text-sm text-gray-900">{area.postal_code}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePostalCode(area.id)}
                      className="text-orange-500 hover:text-orange-600 flex items-center space-x-1"
                    >
                      <span className="material-icons">remove</span>
                      
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
