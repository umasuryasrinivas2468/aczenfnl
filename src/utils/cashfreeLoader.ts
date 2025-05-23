// Type definition for Cashfree in window object
declare global {
  interface Window {
    Cashfree?: any;
    cashfree?: any;
  }
}

// Keep track of whether the script is already being loaded
let isLoading = false;
let isInitialized = false;
let cashfreeInstance = null;

/**
 * Loads the Cashfree SDK and initializes it
 * @returns A promise that resolves when the SDK is loaded and initialized
 */
export const loadCashfreeSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already initialized, resolve immediately
    if (isInitialized && cashfreeInstance) {
      console.log("Cashfree SDK already initialized");
      return resolve();
    }
    
    // If the SDK is already loaded
    if (window.Cashfree) {
      try {
        console.log("Cashfree SDK found, initializing...");
        // Use the constructor pattern for v3 SDK
        cashfreeInstance = window.Cashfree({
          mode: "production"
        });
        console.log("Cashfree SDK initialized with production mode");
        isInitialized = true;
        return resolve();
      } catch (error) {
        console.error("Error initializing existing Cashfree SDK:", error);
        return reject(error);
      }
    }
    
    // If already loading, wait for it
    if (isLoading) {
      console.log("Cashfree SDK already loading, waiting...");
      
      // Check every 100ms if SDK is available
      const checkInterval = setInterval(() => {
        if (window.Cashfree) {
          clearInterval(checkInterval);
          try {
            // Use the constructor pattern for v3 SDK
            cashfreeInstance = window.Cashfree({
              mode: "production"
            });
            console.log("Cashfree SDK initialized after waiting");
            isInitialized = true;
            resolve();
          } catch (error) {
            console.error("Error initializing Cashfree SDK after waiting:", error);
            reject(error);
          }
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Timeout waiting for Cashfree SDK to load"));
      }, 5000);
      
      return;
    }
    
    // Start loading the SDK
    isLoading = true;
    console.log("Loading Cashfree SDK from CDN");
    
    // Create script tag with v3 SDK URL
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    
    script.onload = () => {
      console.log("Cashfree SDK loaded from CDN");
      isLoading = false;
      
      try {
        if (window.Cashfree) {
          // Initialize with production mode
          cashfreeInstance = window.Cashfree({
            mode: "production"
          });
          console.log("Cashfree SDK initialized with production mode");
          isInitialized = true;
          resolve();
        } else {
          const error = new Error("Cashfree SDK loaded but not available on window object");
          console.error(error.message);
          reject(error);
        }
      } catch (error) {
        console.error("Error initializing Cashfree SDK:", error);
        reject(error);
      }
    };
    
    script.onerror = (error) => {
      console.error("Error loading Cashfree SDK from CDN:", error);
      isLoading = false;
      reject(error);
    };
    
    // Add script to document
    document.body.appendChild(script);
  });
};

/**
 * Gets the initialized Cashfree instance
 * @returns The Cashfree instance or null if not initialized
 */
export const getCashfreeInstance = () => {
  return cashfreeInstance;
};

/**
 * Ensures the Cashfree SDK is initialized before every checkout
 * @returns A promise that resolves when the SDK is ready
 */
export const ensureCashfreeSDK = async (): Promise<any> => {
  try {
    await loadCashfreeSDK();
    
    // Double check that the SDK is properly initialized
    if (window.Cashfree) {
      if (!cashfreeInstance) {
        // Re-initialize just to be safe
        cashfreeInstance = window.Cashfree({
          mode: "production"
        });
      }
      return cashfreeInstance;
    } else {
      throw new Error("Cashfree SDK not available");
    }
  } catch (error) {
    console.error("Failed to ensure Cashfree SDK:", error);
    throw error;
  }
};

export default {
  loadCashfreeSDK,
  ensureCashfreeSDK,
  getCashfreeInstance
}; 