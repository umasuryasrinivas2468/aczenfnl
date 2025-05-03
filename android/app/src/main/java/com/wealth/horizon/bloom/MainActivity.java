package com.wealth.horizon.bloom;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  private static final String TAG = "WealthHorizonActivity";
  
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Log that we're registering plugins
    Log.d(TAG, "Registering Cashfree plugin");
    
    // Register plugins
    this.registerPlugin(CashfreePlugin.class);
    
    Log.d(TAG, "Cashfree plugin registered successfully");
  }
} 