import { createContext, useContext, useReducer, useEffect } from 'react';
import type { MenuItem } from '../db/schema';

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: MenuItem }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' };

const CART_STORAGE_KEY = 'cartState';

const loadCartFromStorage = (): CartState => {
  const storedCart = localStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? JSON.parse(storedCart) : { items: [], restaurantId: null };
};

const saveCartToStorage = (cart: CartState) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState;
  
  switch (action.type) {
    case 'ADD_ITEM': {
      if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
        return state;
      }

      const existingItem = state.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        newState = {
          restaurantId: state.restaurantId ?? action.payload.restaurantId,
          items: [...state.items, { ...action.payload, quantity: 1 }],
        };
      }
      break;
    }

    case 'REMOVE_ITEM':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        restaurantId: state.items.length > 1 ? state.restaurantId : null,
      };
      break;

    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
      break;

    case 'CLEAR_CART':
      newState = { items: [], restaurantId: null };
      break;

    default:
      newState = state;
  }

  saveCartToStorage(newState);  // Save updated state to localStorage
  return newState;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  useEffect(() => {
    saveCartToStorage(state);
  }, [state]);

  const addToCart = (item: MenuItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (itemId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
