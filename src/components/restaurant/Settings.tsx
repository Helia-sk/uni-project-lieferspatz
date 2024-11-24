import React, { useState, useEffect } from 'react';
import type { OpeningHours, DeliveryArea } from '../../db/schema';

const Settings = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // TODO: Fetch settings
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: Save settings
    setSaving(false);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Opening Hours */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Opening Hours
            </h2>

            <div className="space-y-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">
                      {day}
                    </label>
                  </div>
                  <input
                    type="time"
                    className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    defaultValue={openingHours.find(h => h.dayOfWeek === index)?.openTime}
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    defaultValue={openingHours.find(h => h.dayOfWeek === index)?.closeTime}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Delivery Areas
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Add postal code"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
                <button
                  type="button"
                  className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Add
                </button>
              </div >
              <div className="mt-4 space-y-2">
                {deliveryAreas.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span className="text-sm text-gray-900">
                      {area.postalCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        // TODO: Remove delivery area
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;