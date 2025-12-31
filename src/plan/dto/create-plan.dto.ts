import { IsBoolean, IsEnum, IsInt, IsJSON, IsNumber, IsOptional, IsString } from "class-validator";
import { Interval, PlanCategory, PlanType } from "generated/prisma/enums";

export class CreatePlanDto {

  @IsString()
  planName: string;

  @IsNumber()
  amount: number;

  @IsEnum(PlanType)
  @IsOptional()
  PlanType?: PlanType = PlanType.FREE;

  @IsEnum(PlanCategory)
  planCategory: PlanCategory;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(Interval)
  @IsOptional()
  interval?: Interval = Interval.month;

  @IsInt()
  intervalCount: number;

  @IsInt()
  @IsOptional()
  freeTrialDays?: number;

  @IsString()
  productId: string;

  @IsString()
  priceId: string;

  @IsBoolean()
  active: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  maxMembers?: number;

  @IsJSON()
  @IsOptional()
  features?: any;



}
