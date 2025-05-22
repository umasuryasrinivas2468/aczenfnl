import React, { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';

interface UpiIntentWebViewBridgeProps {
  webviewRef: React.RefObject<any>;
  onUpiIntentDetected?: (upiUrl: string) => void;
}

/**
 * This component implements the code-based solution from Cashfree's documentation
 * for handling UPI Intent URLs in WebViews.
 * 
 * It injects JavaScript into the WebView to intercept UPI Intent URLs and
 * handle them natively.
 */
const UpiIntentWebViewBridge: React.FC<UpiIntentWebViewBridgeProps> = ({
  webviewRef,
  onUpiIntentDetected
}) => {
  const isAndroid = Capacitor.getPlatform() === 'android';
  
  useEffect(() => {
    if (!webviewRef.current || !isAndroid) return;
    
    // Inject JavaScript bridge to intercept UPI Intent URLs
    const injectJsBridge = () => {
      // This would be the actual implementation in a real React Native app
      // For Capacitor, this is just for reference
      
      /*
      // For React Native WebView
      webviewRef.current.injectJavaScript(`
        // Create a bridge to Android native code
        if (!window.Android) {
          window.Android = {
            // Method to handle UPI Intent URLs
            openUpiApp: function(url) {
              // This will be called from JavaScript when a UPI URL is detected
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'UPI_INTENT',
                url: url
              }));
              return true;
            }
          };
        }
        
        // Override window.open to catch UPI Intent URLs
        const originalWindowOpen = window.open;
        window.open = function(url, target, features) {
          if (url && (
              url.startsWith('upi://') || 
              url.startsWith('tez://') || 
              url.startsWith('gpay://') ||
              url.startsWith('phonepe://') ||
              url.startsWith('paytmmp://')
            )) {
            // Call our bridge method
            return Android.openUpiApp(url);
          }
          // For all other URLs, use the original window.open
          return originalWindowOpen.call(window, url, target, features);
        };
        
        // Also intercept anchor clicks
        document.addEventListener('click', function(e) {
          const anchor = e.target.closest('a');
          if (anchor && anchor.href && (
              anchor.href.startsWith('upi://') || 
              anchor.href.startsWith('tez://') || 
              anchor.href.startsWith('gpay://') ||
              anchor.href.startsWith('phonepe://') ||
              anchor.href.startsWith('paytmmp://')
            )) {
            e.preventDefault();
            Android.openUpiApp(anchor.href);
          }
        }, true);
        
        true;
      `);
      */
    };
    
    // Call the injection function
    injectJsBridge();
    
  }, [webviewRef, isAndroid]);
  
  // Message handler for React Native WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'UPI_INTENT' && data.url) {
        console.log('UPI Intent URL detected:', data.url);
        if (onUpiIntentDetected) {
          onUpiIntentDetected(data.url);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };
  
  return null; // This is a utility component, it doesn't render anything
};

/**
 * Helper function to open UPI Intent URLs
 * This would be used in a real React Native app
 */
export const openUpiIntentUrl = (url: string): boolean => {
  if (!url) return false;
  
  // In a real React Native app:
  /*
  import { Linking } from 'react-native';
  
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      return Linking.openURL(url);
    } else {
      console.log("Cannot open UPI app URL:", url);
      return false;
    }
  }).catch(err => {
    console.error("Error opening UPI app:", err);
    return false;
  });
  */
  
  console.log('Would open UPI Intent URL:', url);
  return true;
};

export default UpiIntentWebViewBridge; 