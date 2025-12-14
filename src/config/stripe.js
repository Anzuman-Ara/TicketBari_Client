/**
 * Stripe Configuration for Hosted Checkout Pages
 * 
 * For the hosted checkout page approach, we don't need client-side Stripe initialization
 * or publishable keys. The client simply redirects to Stripe's hosted payment page.
 * 
 * All Stripe configuration is handled server-side in the payments.js controller.
 * The client-side code only needs to call the server endpoint to create a checkout session
 * and then redirect the user to the returned session URL.
 */

/**
 * Get Stripe instance - not needed for hosted checkout
 * This function is kept for backward compatibility but returns null
 * since we're using Stripe's hosted checkout pages
 */
export const getStripe = () => {
  console.warn('⚠️ getStripe() is not needed for hosted checkout pages');
  return Promise.resolve(null);
};

/**
 * Format amount for display
 * Kept for utility purposes in the UI
 */
export const formatAmount = (amount, currency = 'BDT') => {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Convert amount to smallest currency unit (for Stripe)
 * Kept for utility purposes
 */
export const toSmallestUnit = (amount, currency = 'BDT') => {
  return Math.round(amount * 100); // Convert to paisa for BDT
};

/**
 * Convert from smallest currency unit to display amount
 * Kept for utility purposes
 */
export const fromSmallestUnit = (amount, currency = 'BDT') => {
  return amount / 100; // Convert from paisa to BDT
};

// Keep empty exports for any existing imports that might still reference these
export const stripeElementsAppearance = {};
export const cardElementOptions = {};
export const paymentElementOptions = {};
export const supportedCurrencies = {};
export const stripeErrorMessages = {};
export const getStripeErrorMessage = () => 'Payment processing is handled by Stripe hosted checkout';

export default getStripe;
