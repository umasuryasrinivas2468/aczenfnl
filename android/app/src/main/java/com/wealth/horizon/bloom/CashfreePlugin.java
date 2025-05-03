package com.wealth.horizon.bloom;

import android.content.Intent;
import android.util.Log;
import android.os.Looper;
import android.os.Handler;

import com.cashfree.pg.api.CFPaymentGatewayService;
import com.cashfree.pg.core.api.CFSession;
import com.cashfree.pg.core.api.callback.CFCheckoutResponseCallback;
import com.cashfree.pg.core.api.exception.CFException;
import com.cashfree.pg.core.api.utils.CFErrorResponse;
import com.cashfree.pg.core.api.webcheckout.CFWebCheckoutPayment;
import com.cashfree.pg.core.api.webcheckout.CFWebCheckoutTheme;
import com.cashfree.pg.core.api.upi.CFUPIIntentCheckout;
import com.cashfree.pg.core.api.upi.CFIntentTheme;
import com.cashfree.pg.core.api.upi.CFUPIIntentCheckoutPayment;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;
import java.util.Arrays;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "CashfreePayment")
public class CashfreePlugin extends Plugin implements CFCheckoutResponseCallback {
    private static final String TAG = "CashfreePlugin";
    private PluginCall savedCall;
    private boolean isInitialized = false;

    @Override
    public void load() {
        try {
            // Initialize Cashfree SDK
            initializeCashfreeSDK();
            Log.d(TAG, "Cashfree SDK initialized");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Cashfree SDK", e);
        }
    }

    private void initializeCashfreeSDK() {
        if (!isInitialized) {
            try {
                // Initialize on a background thread
                Executors.newSingleThreadExecutor().execute(() -> {
                    try {
                        CFPaymentGatewayService.getInstance().setCheckoutCallback(this);
                        isInitialized = true;
                        Log.d(TAG, "Cashfree SDK initialization complete");
                    } catch (CFException e) {
                        Log.e(TAG, "Error in background SDK initialization", e);
                    }
                });
            } catch (Exception e) {
                Log.e(TAG, "Error setting up SDK initialization thread", e);
            }
        }
    }

    @PluginMethod
    public void doWebPayment(PluginCall call) {
        try {
            savedCall = call;
            
            // Extract parameters from call
            String paymentSessionId = call.getString("paymentSessionId");
            String orderId = call.getString("orderId");
            String environment = call.getString("environment", "PRODUCTION");
            
            if (paymentSessionId == null || orderId == null) {
                call.reject("Payment session ID and order ID are required");
                return;
            }

            Log.d(TAG, "Starting web payment with session ID: " + paymentSessionId);
            Log.d(TAG, "Order ID: " + orderId);
            Log.d(TAG, "Environment: " + environment);
            
            // Create session
            CFSession.Environment env = environment.equals("SANDBOX") 
                ? CFSession.Environment.SANDBOX 
                : CFSession.Environment.PRODUCTION;
                
            CFSession cfSession = new CFSession.CFSessionBuilder()
                    .setEnvironment(env)
                    .setPaymentSessionID(paymentSessionId)
                    .setOrderId(orderId)
                    .build();
            
            // Create web theme (optional) - only use the methods available in this SDK version
            CFWebCheckoutTheme cfTheme = new CFWebCheckoutTheme.CFWebCheckoutThemeBuilder()
                    .setNavigationBarBackgroundColor("#3B82F6")
                    .setNavigationBarTextColor("#FFFFFF")
                    .build();
            
            // Create checkout payment object
            CFWebCheckoutPayment cfWebCheckoutPayment = new CFWebCheckoutPayment.CFWebCheckoutPaymentBuilder()
                    .setSession(cfSession)
                    .setCFWebCheckoutUITheme(cfTheme)
                    .build();

            Log.d(TAG, "Initiating web payment with Cashfree SDK");
            
            // Do payment
            CFPaymentGatewayService.getInstance().doPayment(getActivity(), cfWebCheckoutPayment);
            
        } catch (CFException e) {
            Log.e(TAG, "Error in doWebPayment", e);
            call.reject("Cashfree SDK error: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error in doWebPayment", e);
            call.reject("Unexpected error: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void doUPIPayment(PluginCall call) {
        try {
            savedCall = call;
            
            // Extract parameters from call
            String paymentSessionId = call.getString("paymentSessionId");
            String orderId = call.getString("orderId");
            String environment = call.getString("environment", "PRODUCTION");
            
            if (paymentSessionId == null || orderId == null) {
                call.reject("Payment session ID and order ID are required");
                return;
            }
            
            Log.d(TAG, "Starting UPI payment with session ID: " + paymentSessionId);
            Log.d(TAG, "Order ID: " + orderId);
            Log.d(TAG, "Environment: " + environment);
            
            // Create session
            CFSession.Environment env = environment.equals("SANDBOX") 
                ? CFSession.Environment.SANDBOX 
                : CFSession.Environment.PRODUCTION;
                
            CFSession cfSession = new CFSession.CFSessionBuilder()
                    .setEnvironment(env)
                    .setPaymentSessionID(paymentSessionId)
                    .setOrderId(orderId)
                    .build();
            
            try {
                // Create UPI theme
                CFIntentTheme cfTheme = new CFIntentTheme.CFIntentThemeBuilder()
                        .setPrimaryTextColor("#000000")
                        .setBackgroundColor("#FFFFFF")
                        .build();
                
                // Create UPI checkout object - do not set order yet to avoid potential issues
                CFUPIIntentCheckout cfupiIntentCheckout = new CFUPIIntentCheckout.CFUPIIntentBuilder()
                        .build();
                
                // Create UPI checkout payment
                CFUPIIntentCheckoutPayment cfupiIntentCheckoutPayment = new CFUPIIntentCheckoutPayment.CFUPIIntentPaymentBuilder()
                        .setSession(cfSession)
                        .setCfUPIIntentCheckout(cfupiIntentCheckout)
                        .setCfIntentTheme(cfTheme)
                        .build();
                
                Log.d(TAG, "Initiating UPI Intent payment with Cashfree SDK");
                
                // Do payment
                CFPaymentGatewayService.getInstance().doPayment(getActivity(), cfupiIntentCheckoutPayment);
            } catch (CFException e) {
                Log.e(TAG, "Error in UPI intent setup", e);
                // Fall back to web checkout if UPI intent setup fails
                handleUPIFallback(cfSession);
            }
            
        } catch (CFException e) {
            Log.e(TAG, "Error in doUPIPayment", e);
            call.reject("Cashfree SDK error: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Unexpected error in doUPIPayment", e);
            call.reject("Unexpected error: " + e.getMessage());
        }
    }
    
    // Fallback to web checkout if UPI intent fails
    private void handleUPIFallback(CFSession cfSession) throws CFException {
        Log.d(TAG, "Falling back to web checkout due to UPI setup failure");
        
        // Create web theme
        CFWebCheckoutTheme cfTheme = new CFWebCheckoutTheme.CFWebCheckoutThemeBuilder()
                .setNavigationBarBackgroundColor("#3B82F6")
                .setNavigationBarTextColor("#FFFFFF")
                .build();
        
        // Create checkout payment object
        CFWebCheckoutPayment cfWebCheckoutPayment = new CFWebCheckoutPayment.CFWebCheckoutPaymentBuilder()
                .setSession(cfSession)
                .setCFWebCheckoutUITheme(cfTheme)
                .build();
        
        // Do payment with web checkout as fallback
        CFPaymentGatewayService.getInstance().doPayment(getActivity(), cfWebCheckoutPayment);
    }
    
    // Handle payment callbacks from Cashfree SDK
    @Override
    public void onPaymentVerify(String orderID) {
        Log.d(TAG, "Payment verified for order: " + orderID);
        if (savedCall != null) {
            // Execute on UI thread to prevent "Only original thread that created a view hierarchy can touch its views" error
            new Handler(Looper.getMainLooper()).post(() -> {
                JSObject result = new JSObject();
                result.put("status", "success");
                result.put("orderId", orderID);
                savedCall.resolve(result);
                savedCall = null;
            });
        }
    }
    
    @Override
    public void onPaymentFailure(CFErrorResponse cfErrorResponse, String orderID) {
        Log.e(TAG, "Payment failed: " + cfErrorResponse.getMessage() + " for order: " + orderID);
        if (savedCall != null) {
            // Execute on UI thread
            new Handler(Looper.getMainLooper()).post(() -> {
                JSObject error = new JSObject();
                error.put("status", "failed");
                error.put("orderId", orderID);
                error.put("message", cfErrorResponse.getMessage());
                error.put("code", cfErrorResponse.getCode());
                savedCall.reject(cfErrorResponse.getMessage(), error);
                savedCall = null;
            });
        }
    }
    
    // Handle activity result (important for UPI intents)
    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        Log.d(TAG, "Activity result received: requestCode=" + requestCode + ", resultCode=" + resultCode);
        super.handleOnActivityResult(requestCode, resultCode, data);
        
        // Process the payment gateway callback
        try {
            if (data != null) {
                try {
                    // In Cashfree SDK, handleResponse method is needed for UPI intent
                    CFPaymentGatewayService.getInstance().handleResponse(data);
                    Log.d(TAG, "Activity result processed with handleResponse");
                } catch (Exception e) {
                    Log.e(TAG, "Error handling response: " + e.getMessage());
                }
            } else {
                Log.d(TAG, "Activity result has null data");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling activity result", e);
        }
    }
} 