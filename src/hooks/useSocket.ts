import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useSocket = (onNewOrder: (data: any) => void) => {
  useEffect(() => {
    const socket = io('http://localhost:5050'); // Adjust the URL as needed

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('new_order', (data) => {
      console.log('New order received:', data);
      onNewOrder(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, [onNewOrder]);
};

export default useSocket;