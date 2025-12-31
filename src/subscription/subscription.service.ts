import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from 'src/common/stripe/stripe.service';


@Injectable()


export class SubscriptionService {

constructor(  private readonly prisma: PrismaService,
  private readonly stripe: StripeService,){}

async create(userId: string, planId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const plan = await this.prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new NotFoundException("Plan not found");
  }

  const startDate = new Date();
  let endDate: Date | null = null;

  if (plan.interval === "month") {
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (plan.intervalCount || 1));

    if (endDate.getDate() !== startDate.getDate()) {
      endDate.setDate(0);
    }
  } else if (plan.interval === "year") {
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + (plan.intervalCount || 1));
  }

  const paymentIntent = await this.stripe.stripe.paymentIntents.create({
    amount: Math.round(plan.amount * 100),
    currency: "usd",
    metadata: {
      userId: user.id,
      planId,
      planType: plan.PlanType,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return await this.prisma.$transaction(async (tx) => {
    const existingSubscription = await tx.subscription.findUnique({
      where: { userId: user.id },
    });

    let subscription;
    if (existingSubscription?.paymentStatus === "PENDING") {
      subscription = await tx.subscription.update({
        where: { userId: user.id },
        data: {
          planId,
          stripePaymentId: paymentIntent.id,
          startDate,
          amount: plan.amount,
          endDate: endDate,
          paymentStatus: "PENDING",
        },
      });
    } else {
      subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          planId,
          startDate,
          amount: plan.amount,
          stripePaymentId: paymentIntent.id,
          paymentStatus: "PENDING",
          endDate,
        },
      });
    }

    return {
      subscription,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      planType: plan.PlanType,
    };
  }, {
    maxWait: 5000,
    timeout: 10000,
  });
}

  findAll() {
    return `This action returns all subscription`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}



