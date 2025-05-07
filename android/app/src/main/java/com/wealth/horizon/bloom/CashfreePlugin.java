package com.wealth.horizon.bloom;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "CashfreePayment")
public class CashfreePlugin extends Plugin {
    private static final String TAG = "CashfreePlugin";
    private static final String CASHFREE_PAYMENT_URL = "https://payments.cashfree.com/forms";
    private PluginCall savedCall;

    @PluginMethod
    public void doWebPayment(PluginCall call) {
        try {
            savedCall = call;
            
            // Extract parameters from call
            String orderId = call.getString("orderId", "order_" + System.currentTimeMillis());
            String amount = call.getString("amount", "1.00");
            String customerName = call.getString("customerName", "Customer");
            String customerEmail = call.getString("customerEmail", "customer@example.com");
            String customerPhone = call.getString("customerPhone", "9999999999");
            
            // App ID for Cashfree
            String appId = "850529145692c9f93773ed2c0a925058";
            
            // Build the payment URL
            Uri.Builder builder = Uri.parse(CASHFREE_PAYMENT_URL).buildUpon();
            builder.appendQueryParameter("code", appId)
                   .appendQueryParameter("amount", amount)
                   .appendQueryParameter("orderId", orderId)
                   .appendQueryParameter("customerName", customerName)
                   .appendQueryParameter("customerEmail", customerEmail)
                   .appendQueryParameter("customerPhone", customerPhone)
                   .appendQueryParameter("orderDescription", "Purchase from Wealth Horizon")
                   .appendQueryParameter("source", "wealth-horizon-app");
            
            String paymentUrl = builder.build().toString();
            Log.d(TAG, "Opening payment URL: " + paymentUrl);
            
            // Open the URL in the browser
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl));
            getActivity().startActivity(intent);
            
            // Return success to the caller
            JSObject result = new JSObject();
            result.put("status", "opened");
            result.put("orderId", orderId);
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "Error opening payment URL", e);
            call.reject("Error opening payment: " + e.getMessage());
        }
    }
    
    @PluginMethod
    public void doUPIPayment(PluginCall call) {
        // Just use the same web payment for simplicity
        doWebPayment(call);
    }
}