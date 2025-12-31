import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlanService {

  private stripe:Stripe

  constructor(  private configService: ConfigService,
  private prisma: PrismaService){ const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    if (!apiKey) {
      throw new Error('Stripe API key is not defined');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });}


  
 async create(payload: CreatePlanDto) {


    const product = await this.stripe.products.create({
    name: payload.planName,
    description: payload.description!,
    active: true,
    metadata: {
      planCategory: payload.planCategory,
    },
  });

  
  const priceConfig: any = {
    currency: "usd",
    unit_amount: Math.round(payload.amount * 100),
    active: true,
    product: product.id,
    metadata: {
      maxMembers: payload.maxMembers?.toString() || "1",
      planCategory: payload.planCategory, 
    },
  };


  const price = await  this.stripe.prices.create(priceConfig);

  const result = await this.prisma.$transaction(async (tx) => {


    const dbPlan = await tx.plan.create({
      data: {
        amount: payload.amount || 0,
        planName: payload.planName,
        PlanType: payload.PlanType,
        planCategory: payload.planCategory, 
        currency: "usd",
        interval: payload.interval,
        intervalCount: payload.intervalCount,
        productId: product.id,
        priceId: price.id,
        active: payload.active ?? true, 
        description: payload.description,
        features: payload.features || [],
        maxMembers: payload.maxMembers || 1, 
      },
    });

    return dbPlan;
  }, {
    maxWait: 5000,
    timeout: 10000,
  });


    return result
  }

  findAll() {


    return `This action returns all plan`;
  }

  findOne(id: number) {
    return `This action returns a #${id} plan`;
  }

  update(id: number, updatePlanDto: UpdatePlanDto) {
    return `This action updates a #${id} plan`;
  }

  remove(id: number) {
    return `This action removes a #${id} plan`;
  }
}
