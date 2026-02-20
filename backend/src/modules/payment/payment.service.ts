// Import the model
import { Request } from 'express';
import Stripe from 'stripe';
import config from '../../config/config';
import { IdOrIdsInput, SearchQueryInput } from '../../handlers/common-zod-validator';
import { CreatePaymentInput } from './payment.validation';

export const stripe = new Stripe(config.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover',
});

const getClientBaseUrl = (): string => {
  const rawClientUrl = config.CLIENT_URL?.trim();
  const fallbackUrl = 'http://localhost:3000';

  if (!rawClientUrl) return fallbackUrl;

  const hasScheme = /^https?:\/\//i.test(rawClientUrl);
  const normalized = hasScheme ? rawClientUrl : `http://${rawClientUrl}`;

  try {
    return new URL(normalized).toString().replace(/\/$/, '');
  } catch {
    return fallbackUrl;
  }
};

/**
 * Service function to create a new payment.
 *
 * @param {string} userId - The ID of the user making the payment.
 * @param {CreatePaymentInput} data - The data to create a new payment.
 * @returns {Promise<Partial<any>>} - The created payment.
 */
const createPayment = async (userId: string, data: CreatePaymentInput): Promise<Partial<any>> => {
  // TODO: check any plan already purchased by the user, if yes, then don't allow to purchase any more plan until the existing plan expires
  const clientBaseUrl = getClientBaseUrl();

  /**
   * Create Stripe Checkout Session
   */
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'GBP',
          product_data: {
            name: `Plan ${data.subscriptionPricingId} Subscription`,
          },
          unit_amount: Math.round(50000 * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${clientBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientBaseUrl}/cancel`,
    metadata: {
      userId,
      planId: data.subscriptionPricingId,
    },
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
    cancel: session.cancel_url,
  };
};

const stripePaymentWebHook = async (req: Request) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = config.STRIPE_WEBHOOK_SECRET || 'whsec_xxxxx';

  if (!signature || Array.isArray(signature)) {
    throw new Error('Missing or invalid Stripe signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown webhook error';
    throw new Error(`Webhook Error: ${message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Payment successful for session:', session.id);
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log('PaymentIntent was successful:', paymentIntent.id);
  }

  return { received: true };
};

/**
 * Service function to retrieve a single payment by ID.
 *
 * @param {IdOrIdsInput['id']} id - The ID of the payment to retrieve.
 * @returns {Promise<Partial<any>>} - The retrieved payment.
 */
const getPaymentById = async (id: IdOrIdsInput['id']): Promise<Partial<any> | null> => {
  return null;
};

/**
 * Service function to retrieve multiple payment based on query parameters.
 *
 * @param {SearchQueryInput} query - The query parameters for filtering payment.
 * @returns {Promise<Partial<any>[]>} - The retrieved payment
 */
const getManyPayment = async (
  query: SearchQueryInput
): Promise<{ payments: Partial<any>[]; totalData: number; totalPages: number }> => {
  return {
    payments: [],
    totalData: 0,
    totalPages: 0,
  };
};

export const paymentServices = {
  createPayment,
  stripePaymentWebHook,
  getPaymentById,
  getManyPayment,
};
