import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

export const createStripeClient = (configService: ConfigService): Stripe => {
  const apiKey = configService.get<string>('STRIPE_SECRET_KEY');
  
  if (!apiKey) {
    throw new Error('Stripe API key is not defined');
  }

  return new Stripe(apiKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
};