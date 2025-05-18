import { checkAndUpdatePendingTransactions, syncAllTransactions } from './transactionService';

// Time intervals in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Schedule IDs
let pendingTransactionCheckInterval: number | null = null;
let transactionSyncInterval: number | null = null;

/**
 * Start scheduled task to check pending transactions
 */
export const startPendingTransactionCheck = (intervalMs: number = 5 * MINUTE) => {
  if (pendingTransactionCheckInterval) {
    clearInterval(pendingTransactionCheckInterval);
  }
  
  console.log(`Starting pending transaction check every ${intervalMs / 1000} seconds`);
  
  // Immediately run once
  checkAndUpdatePendingTransactions()
    .then(({ updated }) => {
      if (updated > 0) {
        console.log(`Initial check updated ${updated} transactions`);
      } else {
        console.log('No pending transactions found in initial check');
      }
    })
    .catch(error => console.error('Error in initial pending transaction check:', error));
  
  // Set interval for future checks
  pendingTransactionCheckInterval = window.setInterval(async () => {
    try {
      const { updated } = await checkAndUpdatePendingTransactions();
      if (updated > 0) {
        console.log(`Scheduled check updated ${updated} transactions`);
      }
    } catch (error) {
      console.error('Error in scheduled pending transaction check:', error);
    }
  }, intervalMs);
  
  return pendingTransactionCheckInterval;
};

/**
 * Start scheduled task to sync all transactions
 */
export const startTransactionSync = (intervalMs: number = 1 * HOUR) => {
  if (transactionSyncInterval) {
    clearInterval(transactionSyncInterval);
  }
  
  console.log(`Starting transaction sync every ${intervalMs / 1000} seconds`);
  
  // Run once on startup
  syncAllTransactions()
    .then(({ updated }) => {
      if (updated > 0) {
        console.log(`Initial sync updated ${updated} transactions`);
      } else {
        console.log('No transactions updated in initial sync');
      }
    })
    .catch(error => console.error('Error in initial transaction sync:', error));
  
  // Set interval for future syncs
  transactionSyncInterval = window.setInterval(async () => {
    try {
      const { updated } = await syncAllTransactions();
      if (updated > 0) {
        console.log(`Scheduled sync updated ${updated} transactions`);
      }
    } catch (error) {
      console.error('Error in scheduled transaction sync:', error);
    }
  }, intervalMs);
  
  return transactionSyncInterval;
};

/**
 * Stop scheduled task to check pending transactions
 */
export const stopPendingTransactionCheck = () => {
  if (pendingTransactionCheckInterval) {
    clearInterval(pendingTransactionCheckInterval);
    pendingTransactionCheckInterval = null;
    console.log('Stopped pending transaction check');
  }
};

/**
 * Stop scheduled task to sync all transactions
 */
export const stopTransactionSync = () => {
  if (transactionSyncInterval) {
    clearInterval(transactionSyncInterval);
    transactionSyncInterval = null;
    console.log('Stopped transaction sync');
  }
};

/**
 * Start all scheduled tasks
 */
export const startAllScheduledTasks = () => {
  startPendingTransactionCheck();
  startTransactionSync();
};

/**
 * Stop all scheduled tasks
 */
export const stopAllScheduledTasks = () => {
  stopPendingTransactionCheck();
  stopTransactionSync();
};

// Export a combined function to initialize all scheduled tasks
export const initializeScheduledTasks = () => {
  startAllScheduledTasks();
  
  // Set up visibility change handler
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Page became visible, run an immediate check
      checkAndUpdatePendingTransactions().catch(err => {
        console.error('Error checking transactions on visibility change:', err);
      });
    }
  });
  
  return {
    stop: () => {
      stopAllScheduledTasks();
    }
  };
};

export default initializeScheduledTasks; 