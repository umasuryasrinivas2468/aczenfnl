import { checkAndUpdateAllPendingTransactions } from './webhooks/cashfree';

export default async function handler(req, res) {
  // Only allow GET or POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional user ID parameter to filter transactions
    const userId = req.query.userId || null;
    
    console.log('Running manual check for pending transactions');
    
    // Call the function to update all pending transactions
    const result = await checkAndUpdateAllPendingTransactions(userId);
    
    return res.status(200).json({
      success: true,
      message: `Checked pending transactions. Updated ${result.updated} transactions.`,
      ...result
    });
  } catch (error) {
    console.error('Error in transaction check:', error);
    return res.status(500).json({ error: 'Failed to check pending transactions' });
  }
} 