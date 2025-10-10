import {useState} from 'react';
import RazorpayCheckout from 'react-native-razorpay';

// Your Razorpay Keys
const RAZORPAY_KEY_ID = "rzp_test_AbH4EMmGnjMnzc";

const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);

  const submitHandler = async (amount, notes = {}, userData = {}) => {
    return new Promise((resolve) => {
      setLoading(true);
      
      try {
        const options = {
          description: notes.description || 'Payment',
          image: notes.image || 'https://your-logo-url.com/logo.png',
          currency: 'INR',
          key: RAZORPAY_KEY_ID,
          amount: Math.round(amount * 100), // Amount in paise
          name: notes.appName || 'MediCare App',
          prefill: {
            email: userData.email || 'patient@example.com',
            contact: userData.contact || '9999999999',
            name: userData.name || 'Customer Name',
          },
          theme: {color: '#1E90FF'},
          notes: notes,
        };

        console.log('Razorpay Options:', options);

        RazorpayCheckout.open(options)
          .then((data) => {
            setLoading(false);
            console.log('Payment Success:', data);
            resolve({
              status: 'SUCCESS',
              data: data,
              paymentId: data.razorpay_payment_id,
              transactionId: data.razorpay_payment_id,
              paymentMethod: 'razorpay',
            });
          })
          .catch((error) => {
            setLoading(false);
            console.log('Payment Error:', error);
            
            // Error codes reference
            if (error.code === 2) {
              resolve({
                status: 'CANCELLED',
                error: 'Payment cancelled by user',
              });
            } else if (error.code === 0) {
              resolve({
                status: 'NETWORK_ERROR',
                error: 'Network error occurred',
              });
            } else {
              resolve({
                status: 'FAILED',
                error: error.description || 'Payment failed',
              });
            }
          });
      } catch (error) {
        setLoading(false);
        console.log('Razorpay Initialization Error:', error);
        resolve({
          status: 'FAILED',
          error: 'Payment initialization failed',
        });
      }
    });
  };

  return {
    submitHandler,
    loading,
  };
};

export default useRazorpayPayment;