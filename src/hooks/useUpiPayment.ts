import { useState } from 'react';
import { initiateUpiDeepLink, verifyUpiPayment } from '../services/cashfreeUpiService';
import { generateOrderId } from '../services/paymentService';
import { useQuery } from '@tanstack/react-query';

interface UseUpiPaymentProps {
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UpiPaymentState {
  orderId: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  paymentLink: string | null;
  error: Error | null;
}

export const useUpiPayment = ({
  amount,
  customerDetails,
  onSuccess,
  onError
}: UseUpiPaymentProps) => {
  const [state, setState] = useState<UpiPaymentState>({
    orderId: null,
    status: 'idle',
    paymentLink: null,
    error: null
  });

  // Function to start the payment process
  const startPayment = async (customOrderId?: string) => {
    try {
      setState({ ...state, status: 'loading', error: null });
      
      // Generate a new order ID or use the provided one
      const orderId = customOrderId || generateOrderId();
      
      // Validate customer details
      if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
        throw new Error('Customer details are required for UPI payment');
      }
      
      // Initiate the UPI payment
      const result = await initiateUpiDeepLink(orderId, amount, customerDetails);
      
      setState({
        orderId: orderId,
        status: 'success',
        paymentLink: result.paymentLink,
        error: null
      });
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown payment error');
      
      setState({
        ...state,
        status: 'error',
        error: err
      });
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    }
  };

  // Query to check payment status
  const { data: paymentStatus, refetch } = useQuery({
    queryKey: ['paymentStatus', state.orderId],
    queryFn: () => state.orderId ? verifyUpiPayment(state.orderId) : Promise.resolve(null),
    enabled: !!state.orderId, // Only run when there's an orderId
    refetchInterval: state.status === 'success' ? 5000 : false, // Poll every 5 seconds after payment is initiated
  });

  return {
    ...state,
    paymentStatus,
    startPayment,
    checkStatus: refetch
  };
}; 