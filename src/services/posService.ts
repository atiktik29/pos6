import { collection, addDoc, updateDoc, doc, runTransaction, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product, POSTransaction } from '@/types';
import { updateDailySales } from './dailySalesService';

// Process a POS transaction and update inventory
export const processPOSTransaction = async (transaction: Omit<POSTransaction, 'id'>) => {
  try {
    console.log('Processing POS transaction:', JSON.stringify(transaction, null, 2));
    let transactionId = '';
    
    // STEP 1: First perform all reads in a transaction to check stock
    const productUpdates = await runTransaction(db, async (firestoreTransaction) => {
      const updates = [];
      
      // Read all product documents first to check stock
      for (const item of transaction.items) {
        const productRef = doc(db, 'products', item.product.id);
        const productDoc = await firestoreTransaction.get(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`Product ${item.product.name} not found`);
        }
        
        const productData = productDoc.data() as Product;
        
        // Check if there's enough stock
        if (productData.stock < item.quantity) {
          throw new Error(`Not enough stock for ${item.product.name}. Available: ${productData.stock}, Requested: ${item.quantity}`);
        }
        
        // Store update for later execution
        updates.push({
          productRef,
          currentStock: productData.stock,
          quantityToReduce: item.quantity
        });
      }
      
      return updates;
    });
    
    // STEP 2: Now perform all writes in a separate transaction
    await runTransaction(db, async (firestoreTransaction) => {
      // Update stock for all products
      for (const update of productUpdates) {
        firestoreTransaction.update(update.productRef, {
          stock: update.currentStock - update.quantityToReduce,
          updated_at: new Date().toISOString()
        });
      }
    });
    
    // STEP 3: Create transaction record
    try {
      // Get current date in YYYY-MM-DD format for easier filtering
      const transactionDateString = new Date().toISOString().split('T')[0];

      // Create a simplified version of items without full product objects
      const transactionItems = transaction.items.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          category: item.product.category,
          image_url: item.product.image_url
        },
        price: item.price, 
        quantity: item.quantity,
        totalPrice: item.totalPrice
      }));
      
      const transactionRef = await addDoc(collection(db, 'pos_transactions'), {
        items: transactionItems,
        totalAmount: transaction.totalAmount,
        paymentMethod: transaction.paymentMethod,
        cashReceived: transaction.cashReceived,
        change: transaction.change,
        status: transaction.status, 
        cashierId: transaction.cashierId,
        cashierName: transaction.cashierName,
        // Use Firestore Timestamp for better querying
        timestamp: Timestamp.now(),
        // Keep createdAt for backward compatibility - use the same time as timestamp
        createdAt: new Date().toISOString(), 
        // Add a date string for easier filtering
        dateString: transactionDateString
      });
      
      transactionId = transactionRef.id;
      console.log('POS transaction saved with ID:', transactionId);
      
      // Create financial transaction record
      await addDoc(collection(db, 'financial_transactions'), {
        transactionId: transactionId,
        date: transactionDateString, // YYYY-MM-DD format
        category: 'sales',
        type: 'income',
        amount: transaction.totalAmount, 
        description: `POS Sale by ${transaction.cashierName}`,
        paymentMethod: transaction.paymentMethod, 
        // Use Firestore Timestamp for better querying
        timestamp: Timestamp.now(),
        // Keep createdAt for backward compatibility - use the same time as timestamp
        createdAt: new Date().toISOString(),
        // Add a date string for easier filtering
        dateString: transactionDateString
      });
      
      console.log('Financial transaction record created');
      
      // STEP 4: Update daily sales record
      try {
        await updateDailySales(transactionDateString, transaction.totalAmount);
      } catch (dailySalesError) {
        console.error('Error updating daily sales:', dailySalesError);
        // Continue execution even if daily sales update fails
      }
      
    } catch (error) {
      console.error('Error saving transaction records:', error);
      // Log error but don't throw to ensure we return the transaction ID
      console.warn("Transaction was processed but records may be incomplete");
    }
    
    return transactionId;
  } catch (error) {
    console.error('Error processing POS transaction:', error);
    throw error;
  }
};

// Get financial summary for dashboard
export const getFinancialSummary = async (startDate: Date, endDate: Date) => {
  try {
    // Implement financial summary logic
    // This would fetch transactions between dates and calculate totals
    return {
      totalSales: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactionCount: 0
    };
  } catch (error) {
    console.error('Error getting financial summary:', error);
    throw error;
  }
};