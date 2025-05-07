package com.wealth.horizon.bloom;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.cashfree.pg.api.CFPaymentGatewayService;
import com.cashfree.pg.core.api.CFSession;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Cashfree with your actual credentials
        CFSession session = new CFSession.CFSessionBuilder()
            .setEnvironment(CFSession.Environment.SANDBOX)
            .setAppId("850529145692c9f93773ed2c0a925058") // Your App ID from BuyDialog.tsx
            .build();
            
        CFPaymentGatewayService.getInstance().setSession(session);
    }
}