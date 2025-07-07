import { useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { POSTransaction } from '@/types';

export const usePOSTransactions = (date?: string) => {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Set date range for query
      // Validate date string before creating Date object
      const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) 
        ? new Date(date) 
        : new Date();
        
      // Check if date is valid
      if (isNaN(selectedDate.getTime())) {
        console.error('Invalid date provided:', date);
        setLoading(false);
        setError(new Error('Invalid date format'));
        return () => {};
      }
      
      // Reset time to start of day
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
  // POS feature removed
  return {
    totalSales: 0,
    transactionCount: 0,
    paymentMethodCounts: {},
    paymentMethodTotals: {}
  };
};
  // POS feature removed
  return 'feature-removed';