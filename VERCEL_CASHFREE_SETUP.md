# Vercel & Cashfree Integration Guide

This guide explains how to correctly set up Cashfree webhooks with your Vercel-deployed application.

## 1. Configure Environment Variables in Vercel

Log in to your Vercel dashboard and navigate to your project. Click on "Settings" and then "Environment Variables". Add the following variables:

### Required Environment Variables:

- `NEXT_PUBLIC_APP_URL`: Your full Vercel deployment URL (e.g., `https://your-app.vercel.app`)
- `CASHFREE_SECRET_KEY`: Your Cashfree webhook secret key (you'll create this in the Cashfree dashboard)
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

![Vercel Environment Variables](https://example.com/vercel-env-vars.png)

After adding these variables, redeploy your application for the changes to take effect.

## 2. Configure Cashfree Webhook

1. Log in to your [Cashfree Merchant Dashboard](https://merchant.cashfree.com/merchants/login)
2. Navigate to Settings → Webhooks
3. Click "Add New Webhook"
4. Configure the webhook with the following details:

**Webhook Configuration:**
- **URL**: `https://your-app.vercel.app/api/webhooks/vercel` (replace with your actual Vercel URL)
- **Events to Subscribe**: Select at minimum "Payment Success" and "Payment Failed"
- **Secret Key**: Generate a strong secret key (make note of this to add to Vercel environment variables)
- **Status**: Set to "Active"

5. Save the configuration

The webhook URL should match the API route we've created for handling Cashfree callbacks.

## 3. Test the Integration

1. Make a test payment through your app
2. Monitor the payment status in the Cashfree dashboard
3. Check your Vercel logs to confirm the webhook was received (Dashboard → Deployments → Select deployment → Logs)
4. Verify the data was stored correctly in your Supabase database

## 4. Data Storage Troubleshooting

If data isn't being stored in Supabase despite successful payments:

1. **Check Supabase Tables**: Ensure the `investments` table exists with the correct schema
2. **Check Webhook Logs**: Look at the Vercel function logs to see if there are any errors
3. **Verify Environment Variables**: Make sure your Supabase credentials are correct
4. **Test Direct API Access**: Try inserting data directly through the Supabase client in the console

## 5. Web-to-App Considerations

Since you're using a web-to-app conversion:

1. **Deep Linking**: Ensure your app can handle deep links for payment status redirects
2. **UPI Apps Access**: Web-to-app wrappers sometimes restrict access to other apps through intents 
3. **Cookies & Storage**: Make sure your app has access to localStorage and cookies

## 6. Common Issues & Solutions

### No UPI Option Showing in App

Our updates add UPI support for:
- Native Android devices: Uses UPI Intent (opens payment apps directly)
- Web browsers & web-to-app: Uses Cashfree payment link (supports UPI, cards, netbanking)

### Payment Success but No Data in Database

1. Check if webhooks are correctly reaching your application
2. Verify Supabase connection settings
3. Ensure the table structure matches expected format

### Payment Failed But Money Deducted

In rare cases, payments may be deducted but not registered due to timeout or connectivity issues. Cashfree will usually auto-refund these, but you should have a process to:

1. Record payment attempt details
2. Provide customer support contact
3. Verify with Cashfree merchant dashboard 