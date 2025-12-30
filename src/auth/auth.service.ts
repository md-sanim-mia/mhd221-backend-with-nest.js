import { BadRequestException, ConflictException, Injectable, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto, GenerateOtpDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { UtilsService } from 'src/utils/utils.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginPayloadDto } from './dto/login-auth.dto';
import { ChengePasswordDto } from './dto/chenge-password-auth.dto';
import { retry } from 'rxjs';
@Injectable()
export class AuthService {

  constructor(private prisma:PrismaService, private readonly email:UtilsService,private jwtService:JwtService){}
  async create(generateOtpEmail:GenerateOtpDto) {

   const isUserExistByEmail= await this.prisma.user.findFirst({where:{email:generateOtpEmail.email}})


   if (isUserExistByEmail){

    throw new ConflictException('User already exists') 
   }


   const generateOtp=():string=>{

    return Math.floor(100000+Math.random()*900000).toString()
   }

   await this.prisma.otpModel.deleteMany({where:{
    email:generateOtpEmail.email,
    isVerified:false
   }})


   const otp=generateOtp()
   const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

   await this.prisma.otpModel.create({
    data:{
      email:generateOtpEmail.email,
      code:otp,
      expiresAt:otpExpiresAt,
      isVerified:false
    }
   })

     const emailContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
                    Email Verification
                  </h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                    Secure your account with OTP verification
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hello there,
                  </p>
                  
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    We received a request to verify your email address. Please use the following verification code to proceed:
                  </p>

                  <!-- OTP Box -->
                  <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border: 2px solid #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                      Verification Code
                    </p>
                    <h1 style="color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                      ${otp}
                    </h1>
                  </div>

                  <!-- Important Info -->
                  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                      <strong>⚠️ Important:</strong> This verification code will expire in <strong>10 minutes</strong>. 
                      Please complete your verification before it expires.
                    </p>
                  </div>

                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    If you didn't request this verification code, please ignore this email and ensure your account is secure.
                  </p>

                  <!-- Security Tips -->
                  <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
                    <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">
                      🔒 Security Tips:
                    </h3>
                    <ul style="color: #666666; font-size: 14px; margin: 0; padding-left: 20px;">
                      <li style="margin: 5px 0;">Never share your verification code with anyone</li>
                      <li style="margin: 5px 0;">We will never ask for your code via phone or email</li>
                      <li style="margin: 5px 0;">Always verify the sender's email address</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                  <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                    Need help? Contact our support team
                  </p>
                  <p style="color: #6c757d; font-size: 14px; margin: 0;">
                    Best regards,<br>
                    <strong style="color: #667eea;">Your App Team</strong>
                  </p>
                  
                  <div style="margin-top: 20px;">
                    <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                      This email was sent to ${generateOtpEmail.email}
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;


 const result= await this.email.SendAuthEmail(generateOtpEmail.email, "🔐 Email Verification Code - Action Required", emailContent);

    return result

  }

 //------verify section --------------//

  async verifyUser (otpCode:string,createAuthDto :CreateAuthDto){

    console.log(otpCode,createAuthDto)

    const isUserExistByEmail=await this.prisma.user.findFirst({where:{email:createAuthDto.email}})
    
    if(isUserExistByEmail){
      throw new ConflictException(`User with this email: ${createAuthDto.email} already exists!`)
    }


  if (!createAuthDto.email || !otpCode) {
    throw new BadRequestException( "Email and OTP are required!");
  }

  if (otpCode.length !== 6) {
    throw new BadRequestException("OTP must be 6 digits!");
  }
  if (!createAuthDto) {
    throw new BadRequestException("payload is required !");
  }

const normalizedEmail = createAuthDto.email.toLowerCase().trim();


  const otpRecord = await this.prisma.otpModel.findFirst({
    where: {
      email: createAuthDto.email,
      isVerified: false
    },
    orderBy: {
      generatedAt: 'desc'
    }
  });
  console.log(otpRecord)

  if (!otpRecord) {
    throw new NotFoundException( "OTP not found or already used. Please request a new OTP.");
  }


  if (new Date() > otpRecord?.expiresAt) {

    await this.prisma.otpModel.delete({ 
      where: { id: otpRecord.id } 
    });
    
    throw new UnauthorizedException("OTP has expired. Please request a new verification code.");
  }


  if (otpRecord.code !== otpCode.trim()) {
    throw new UnauthorizedException("Invalid OTP. Please check the code and try again.");
  }


 const result= await this.prisma.otpModel.update({
    where: { id: otpRecord.id },
    data: { 
      isVerified: true 
    }
  });

  const hashedPassword = await bcrypt.hash(createAuthDto.password,12)

  const userData = {
    ...createAuthDto,
    password: hashedPassword,
    isVerified: true,
  };


 const user= await this.prisma.user.create({ data: userData });

 
 return user
  
  }

  //------login  section --------------//


  async login (payload :LoginPayloadDto){

    if(!payload.email || !payload.password){

      throw new BadRequestException("email and password is requried !")

    }


    const isUser=await this.prisma.user.findFirst({where:{email:payload.email}})


     if(!isUser){

      throw new  BadRequestException("Invlide email and password please try agin!")
     }



     const compare=await bcrypt.compare(payload.password,isUser.password)

     if(!compare){


      throw new BadRequestException("Invlide email and password please try agin!")
     }


 const jwtPayload={
userId:isUser.id,
fullName:isUser.fullName,
email :isUser.email,
role:isUser.role,
isVerified:isUser.isVerified
 }


 const accessToken = await this.jwtService.sign(jwtPayload,{
  secret:process.env.JWT_ACCESS_SECRET,
  expiresIn:"10d"
 })

console.log(accessToken)
 const refeshToken=await this.jwtService.sign(jwtPayload,{
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn:"1y",
  
 })


 return{
  accessToken,
  refeshToken
 }
  }

  //------chenge  password section --------------//


 async chengePassword(payload:ChengePasswordDto){

   const user = await this.prisma.user.findFirst({
    where: { email: payload.email }
  });
  
  if (!user) {
    throw new NotFoundException('User not found!');
  }

const isPasswordValid = await bcrypt.compare(payload.currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Current password is incorrect!');
  }


  if (payload.currentPassword === payload.newPassword) {
    throw new BadRequestException('New password must be different from current password!');
  }


  if (payload.newPassword !== payload.confirmPassword) {
    throw new BadRequestException('New password and confirm password do not match!');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

return  await this.prisma.user.update({
    where: { id: user.id },
    data: { 
      password: hashedPassword,
      updatedAt: new Date()
    }
  });



 }
   

//------forget password section --------------//


 async forgetPassword (email:string){

const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new NotFoundException("User not found!");
  }

  if (!user.isVerified) {
    throw new UnauthorizedException("User account is not verified!");
  }
 
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  await this.prisma.user.update({
    where: { email },
    data: {
      isResetPassword: true,
      canResetPassword: false,
      resetPasswordOTP: otp,
      resetPasswordOTPExpiresAt: otpExpiresAt,
    },
  });

 
const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 300;">
                Password Reset Request
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                Reset your password securely with OTP
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${user.fullName}</strong>,
              </p>
              
              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed with resetting your password:
              </p>

              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border: 2px solid #667eea; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                  One-Time Password
                </p>
                <h1 style="color: #667eea; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                  ${otp}
                </h1>
              </div>

              <!-- Important Info -->
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>⚠️ Important:</strong> This OTP will expire in <strong>10 minutes</strong>. 
                  Please complete your password reset before it expires.
                </p>
              </div>

              <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                If you didn't request this password reset, please ignore this email and ensure your account is secure. Your password will remain unchanged.
              </p>

              <!-- Security Tips -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0;">
                <h3 style="color: #333333; font-size: 16px; margin: 0 0 10px 0;">
                  🔒 Security Tips:
                </h3>
                <ul style="color: #666666; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li style="margin: 5px 0;">Never share your OTP with anyone</li>
                  <li style="margin: 5px 0;">We will never ask for your OTP via phone or email</li>
                  <li style="margin: 5px 0;">Always verify the sender's email address</li>
                  <li style="margin: 5px 0;">Use a strong and unique password</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0;">
                Need help? Contact our support team
              </p>
              <p style="color: #6c757d; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong style="color: #667eea;">Your App Team</strong>
              </p>
              
              <div style="margin-top: 20px;">
                <p style="color: #adb5bd; font-size: 12px; margin: 0;">
                  This email was sent to ${user.email}
                </p>
                <p style="color: #adb5bd; font-size: 12px; margin: 10px 0 0 0;">
                  © ${new Date().getFullYear()} Your Company. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


  await this.email.SendAuthEmail(user.email, "Password Reset OTP", emailContent);

  return {
    message:
      "We have sent a 6-digit OTP to your email address. Please check your inbox and use the OTP to reset your password.",
  };

 }




//------verify  forget password request otp section --------------//


 async verifyResetPasswordOTP(payload:{email:string,otp:string}){

   const user = await this.prisma.user.findUnique({
    where: {  email:payload.email },
  });

  if (!user) {
    throw new NotFoundException( "User not found!");
  }

  if (!user.isResetPassword) {
    throw new BadRequestException("No password reset request found!");
  }

  if (!user.resetPasswordOTP || user.resetPasswordOTP !== payload.otp) {
    throw new BadRequestException("Invalid OTP!");
  }


  if (
    !user.resetPasswordOTPExpiresAt ||
    new Date() > user.resetPasswordOTPExpiresAt
  ) {
    throw new BadRequestException("OTP has expired!");
  }



  await this.prisma.user.update({
    where: { email:payload.email },
    data: {
      canResetPassword: true,
      resetPasswordOTP: null,
      resetPasswordOTPExpiresAt: null,
    },
  });

  return {
    message: "OTP verified successfully. You can now reset your password.",
  };
 }


}