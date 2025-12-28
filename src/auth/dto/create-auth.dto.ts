import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { UserRole } from "generated/prisma/enums";

export class CreateAuthDto {
    @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  fullName?: string;

  @IsEmail()
  email: string;

  @IsString()
  storeName: string;

  @IsPhoneNumber() 
  phone: string;

  @IsString()
  country: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsDate()
  passwordChangedAt?: Date;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isResetPassword?: boolean;

  @IsOptional()
  @IsBoolean()
  canResetPassword?: boolean;

  @IsOptional()
  @IsBoolean()
  isResentOtp?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;

  @IsOptional()
  @IsDate()
  planExpiration?: Date;

  @IsOptional()
  @IsDate()
  lastActiveAt?: Date;

  @IsOptional()
  @IsString()
  resetPasswordOTP?: string;

  @IsOptional()
  @IsDate()
  resetPasswordOTPExpiresAt?: Date;
}

export class GenerateOtpDto {
   @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
    email:string 
}
