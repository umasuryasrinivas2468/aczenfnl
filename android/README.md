# Wealth Horizon Bloom - Android Integration

This directory contains the Android project for the Wealth Horizon Bloom application, with integrated Cashfree payment functionality.

## Cashfree Integration

The app includes a native Cashfree payment integration that supports both web checkout and UPI payment methods:

### Features

- Web checkout payment flow
- UPI payment flow (uses the Cashfree UPI interface)
- Native Android integration using Capacitor plugins

### Implementation Details

- `CashfreePlugin.java`: A Capacitor plugin that implements the Cashfree Android SDK integration
- `MainActivity.java`: Registers the Cashfree plugin with Capacitor

### Building and Testing

1. Ensure you have the latest Android SDK and build tools installed
2. Run `npm run build` from the project root to build the web app
3. Run `npx cap sync android` to sync the web build with the Android project
4. Run `npx cap open android` to open the project in Android Studio
5. Build and run the application on a device or emulator

### Environment Configuration

The Cashfree SDK can operate in two environments:

- `SANDBOX`: For development and testing
- `PRODUCTION`: For live payments

The current implementation uses the `SANDBOX` environment by default. To switch to production, update the environment parameter in `src/lib/services/payment.ts`.

### Credentials

The app uses the following Cashfree credentials:

- App ID: `850529145692c9f93773ed2c0a925058`
- Secret Key: `cfsk_ma_prod_ab58890e7f7e53525e9d364fc6effe88_ab702d01`

**Note**: For production use, these should be moved to a secure backend service. Never expose production credentials in client-side code.

## Development Notes

### Adding New Payment Methods

To add additional payment methods:

1. Update the `PaymentMethod` type in `src/components/BuyDialog.tsx`
2. Add UI elements for the new payment method
3. Update the `PaymentService` to handle the new method
4. Implement the corresponding native method in `CashfreePlugin.java`

### Testing Payments

For testing payments in the sandbox environment, use Cashfree's test card numbers:

- Test Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3-digit number
- Name: Any name

For UPI testing:
- Use `success@yesbank` for successful payments
- Use `failure@yesbank` for failed payments 