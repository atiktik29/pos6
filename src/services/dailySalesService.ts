// POS feature removed - keeping interface for type references

// Interface for daily sales data
export interface DailySales {
  date: string; // YYYY-MM-DD format
  totalSales: number;
  transactionCount: number;
  updatedAt: string;
  timestamp?: any; // Firestore Timestamp
}

/**
 * Update daily sales record when a new transaction is processed
 * @param date Date string in YYYY-MM-DD format
 * @param amount Transaction amount
 */
export const updateDailySales = async (date: string, amount: number): Promise<void> => {
  // POS feature removed
  console.log('Daily sales feature has been removed');
};

/**
 * Get daily sales for a specific date
 * @param date Date string in YYYY-MM-DD format
 */
export const getDailySales = async (date: string): Promise<DailySales | null> => {
  // POS feature removed
  return null;
};

/**
 * Get daily sales for a month
 * @param year Year (e.g., 2025)
 * @param month Month (1-12)
 */
export const getMonthlySales = async (year: number, month: number): Promise<DailySales[]> => {
  // POS feature removed
  return [];
};

/**
 * Get recent daily sales
 * @param limit Number of days to retrieve
 */
export const getRecentDailySales = async (limitCount: number = 7): Promise<DailySales[]> => {
  // POS feature removed
  return [];
};