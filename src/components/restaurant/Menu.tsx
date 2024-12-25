import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import type { MenuItem } from '../../db/schema';
import ImageUpload from '../ImageUpload';
import { executeQuery } from '../../db';


type Category = {
  id: string;
  name: string;
};

const defaultCategories: Category[] = [
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Main Courses' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'sides', name: 'Side Dishes' },
];


const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newItemData, setNewItemData] = useState({
    name: '',
    description: '',
    price: '',
    category: defaultCategories[0].id,
    imageUrl: '',
    isAvailable: true
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/menu/', {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based authentication
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching menu items: ${response.statusText}`);
      }
  
      const data: MenuItem[] = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setNewItemData({
      name: '',
      description: '',
      price: '',
      category: defaultCategories[0].id,
      imageUrl: '',
      isAvailable: true
    });
    setIsModalOpen(true);
  };

  
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItemData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category || defaultCategories[0].id,
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await executeQuery('DELETE FROM menu_items WHERE id = ?', [itemId]);
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!newItemData.name || !newItemData.description || !newItemData.price || !newItemData.category) {
      setError('Please fill out all required fields.');
      return;
    }

    const itemData = {
      name: newItemData.name,
      description: newItemData.description,
      price: parseFloat(newItemData.price),
      category: newItemData.category,
      image_url: newItemData.imageUrl,
      is_available: newItemData.isAvailable,
      // restaurant_id is handled by the backend from the session
    };

    console.log('Submitting item:', itemData);

    try {
      let response;
      if (editingItem) {
        // Edit existing item
        response = await fetch(`http://localhost:5000/api/menu/${editingItem.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update item.');
        }

        const updatedItem: MenuItem = await response.json();
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
      } else {
        // Add new item
        response = await fetch('http://localhost:5000/api/menu/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add item.');
        }

        const newItem: MenuItem = await response.json();
        setItems([...items, newItem]);
      }

      setIsModalOpen(false);
      setError(null);
    } catch (error: any) {
      console.error('Failed to save item:', error);
      setError(error.message || 'Failed to save the menu item.');
    }
  };


  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
        <button
          onClick={handleAddItem}
          className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
            ${selectedCategory === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          All Items
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${selectedCategory === category.id
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            <div className="relative">
              <ImageUpload
                imageUrl={item.imageUrl}
                onImageUpload={(file) => {
                  // TODO: Implement image upload
                  console.log('Upload image:', file);
                }}
                className="w-full h-48"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleEditItem(item)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    €{item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>

            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <ImageUpload
                  imageUrl={newItemData.imageUrl}
                  onImageUpload={(file) => {
                    // TODO: Implement image upload
                    console.log('Upload image:', file);
                  }}
                  className="h-48 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={newItemData.category}
                  onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItemData.price}
                  onChange={(e) => setNewItemData({ ...newItemData, price: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={newItemData.isAvailable}
                  onChange={(e) => setNewItemData({ ...newItemData, isAvailable: e.target.checked })}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                  Available for order
                </label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Menu;