import React from 'react';
import { useToast } from 'react-native-toast-notifications';

const ToastMessage = ({ type, message }) => {
  const toast = useToast();

  React.useEffect(() => {
    if (message && type) {
      toast.show(message, {
        type,
        duration: 2000,
        placement: 'top',
      });
    }
  }, [message, type, toast]);

  return null;
};

export default ToastMessage;
