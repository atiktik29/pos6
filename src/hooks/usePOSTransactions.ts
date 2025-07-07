import { useState, useEffect } from 'react';
import { collection, query, getDocs, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
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
      
      const nextDay = new Date(startOfDay);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Convert to Firestore Timestamp objects
      const startTimestamp = Timestamp.fromDate(startOfDay);
      const endTimestamp = Timestamp.fromDate(nextDay);
      
      console.log(`Fetching POS transactions between ${startOfDay.toISOString()} and ${nextDay.toISOString()}`);
      console.log('Date filter:', { 
        inputDate: date, 
        startOfDay: startOfDay.toISOString(), 
        endOfDay: nextDay.toISOString(),
        startTimestamp: startTimestamp,
        endTimestamp: endTimestamp
      });
      
      // Create query with date filter
      const transactionsRef = collection(db, 'pos_transactions');
      const q = query(
        transactionsRef,
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<', endTimestamp)
      );
      
      console.log('Setting up POS transactions listener');
      
      // First check if collection exists and has documents
      getDocs(q).then(initialSnapshot => {
        console.log(`Initial check found ${initialSnapshot.size} transactions`);
        if (initialSnapshot.empty) {
          console.log('No POS transactions found in initial check');
          setTransactions([]);
          setLoading(false);
        } else {
          console.log(`Found ${initialSnapshot.size} POS transactions in initial check`);
        }
      }).catch(err => {
        console.error('Error in initial POS transactions check:', err);
        // Don't set error here, let the snapshot listener handle it
      });

      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          console.log(`Real-time snapshot received with ${snapshot.size} documents for date ${date || 'today'}`);
          
          let transactionData: POSTransaction[] = [];
          snapshot.forEach((doc) => {
            console.log(`Processing transaction document: ${doc.id}`);
            try {
              const data = doc.data() as any;
              // Ensure all required fields exist
              if (data && data.timestamp && Array.isArray(data.items) && typeof data.totalAmount === 'number') {
                // Convert Firestore timestamp to ISO string for consistent usage
                const timestamp = data.timestamp.toDate ? data.timestamp.toDate() : new Date();
                const createdAt = timestamp.toISOString();
                
                console.log(`Transaction ${doc.id} timestamp:`, {
                  rawTimestamp: data.timestamp,
                  convertedDate: timestamp,
                  isoString: createdAt
                });
                
                transactionData.push({ 
                  id: doc.id, 
                  ...data,
                  createdAt: createdAt
                } as POSTransaction);
              } else {
                console.warn(`Skipping transaction ${doc.id} due to missing required fields:`, {
                  hasTimestamp: !!data?.timestamp,
                  hasItems: !!data?.items,
                  isItemsArray: Array.isArray(data?.items),
                  hasTotalAmount: typeof data?.totalAmount === 'number'
                });
              }
            } catch (docError) {
              console.error(`Error processing transaction document ${doc.id}:`, docError);
            }
          });

          // Sort manually since we're not using orderBy
          transactionData.sort((a, b) => {
            // Use timestamp for sorting if available
            const dateA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.createdAt).getTime();
            const dateB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
          
          console.log(`Loaded ${transactionData.length} POS transactions`);
          setTransactions(transactionData);
          
          // Log the first transaction for debugging
          if (transactionData.length > 0) {
            console.log('Sample transaction:', JSON.stringify(transactionData[0]).substring(0, 200) + '...');
          }
          
          setLoading(false);
        } catch (err) {
          console.error('Error processing transaction data:', err);
          setError(new Error(`Failed to process transaction data: ${err.message || 'Unknown error'}`));
          setLoading(false);
        }
      }, (err) => {
        console.error('Error in POS transactions snapshot:', err);
        setError(new Error(`Failed to listen to transactions: ${err.message || 'Unknown error'}`));
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up POS transactions listener:', err);
      setError(new Error(`Failed to set up transaction listener: ${err.message || 'Unknown error'}`));
      setLoading(false);
      return () => {};
    }
  }, [date]);

  return { transactions, loading, error };
};

export const getPOSTransactionsByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date range provided:', { startDate, endDate });
      return [];
    }
    
    // Reset time to start of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Convert to Firestore Timestamp objects
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    console.log('Fetching POS transactions from', startDate.toISOString(), 'to', endDate.toISOString());
    
    const transactionsRef = collection(db, 'pos_transactions');
    // Query with date range
    const q = query(
      transactionsRef,
      where('timestamp', '>=', startTimestamp),
      where('timestamp', '<=', endTimestamp)
    );
    
    try {
      const snapshot = await getDocs(q);
      const transactions: POSTransaction[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        // Ensure we have a valid timestamp
        if (!data.timestamp && !data.createdAt) {
          console.warn(`Transaction ${doc.id} has no timestamp, skipping`);
          return;
        }
        
        let createdAt;
        try {
          // Convert Firestore timestamp to Date object
          const timestamp = data.timestamp?.toDate 
            ? data.timestamp.toDate() 
            : (data.createdAt ? new Date(data.createdAt) : new Date());
          
          // Validate the date
          if (isNaN(timestamp.getTime())) {
            console.warn(`Transaction ${doc.id} has invalid timestamp, using current date`);
            createdAt = new Date().toISOString();
          } else {
            createdAt = timestamp.toISOString();
          }
        } catch (e) {
          console.warn(`Error processing timestamp for transaction ${doc.id}:`, e);
          createdAt = new Date().toISOString();
        }
        
        transactions.push({ 
          id: doc.id, 
          ...data,
          createdAt: createdAt 
        } as POSTransaction);
      });
      
      // Sort manually by date
      transactions.sort((a, b) => {
        // Use timestamp for sorting if available, with validation
        let dateA, dateB;
        
        try {
          dateA = a.timestamp?.toDate 
            ? a.timestamp.toDate().getTime() 
            : (typeof a.createdAt === 'string' && a.createdAt 
              ? new Date(a.createdAt).getTime() 
              : 0);
        } catch (e) {
          dateA = 0;
        }
        
        try {
          dateB = b.timestamp?.toDate 
            ? b.timestamp.toDate().getTime() 
            : (typeof b.createdAt === 'string' && b.createdAt 
              ? new Date(b.createdAt).getTime() 
              : 0);
        } catch (e) {
          dateB = 0;
        }
        
        return dateB - dateA;
      });
      
      console.log(`Found ${transactions.length} transactions in date range`);
      return transactions;
    } catch (error) {
      console.error('Error fetching POS transactions:', error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching POS transactions by date range:', error);
    throw error;
  }
};

// Create a financial transaction record
export const createFinancialTransaction = async (data: {
  transactionId: string;
  date: string;
  category: string;
  type: string;
  amount: number;
  description: string;
  paymentMethod?: string;
}) => {
  try {
    const { addDoc } = await import('firebase/firestore');
    const financialTransactionsRef = collection(db, 'financial_transactions');
    const docRef = await addDoc(financialTransactionsRef, {
      ...data,
      createdAt: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating financial transaction:', error);
    throw error;
  }
};

export const getPOSTransactionsSummary = async (startDate: Date, endDate: Date) => {
  try {
    const transactions = await getPOSTransactionsByDateRange(startDate, endDate);
    
    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const transactionCount = transactions.length;
    
    // Group by payment method
    const paymentMethodCounts: Record<string, number> = {};
    const paymentMethodTotals: Record<string, number> = {};
    
    transactions.forEach(t => {
      const method = t.paymentMethod;
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1;
      paymentMethodTotals[method] = (paymentMethodTotals[method] || 0) + t.totalAmount;
    });
    
    return {
      totalSales,
      transactionCount,
      paymentMethodCounts,
      paymentMethodTotals
    };
  } catch (error) {
    console.error('Error getting POS transactions summary:', error);
    throw error;
  }
};