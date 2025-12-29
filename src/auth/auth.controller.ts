import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, GenerateOtpDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginPayloadDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
 async create(@Body() createAuthDto: GenerateOtpDto) {


    const result=await this.authService.create(createAuthDto)

    return {

      "success":true,
      "message":"We have sent a 6-digit verification code to your email address. Please check your inbox and use the code to complete verification."
    }
  }



  @Post("verify-otp")

  @HttpCode(HttpStatus.OK)
  async verifyUser (@Body() payload:{otp:string, data:CreateAuthDto}){

    if(!payload.otp){
      throw new UnauthorizedException('OTP is missing or invalid');
    }

    const result=await this.authService.verifyUser(payload.otp,payload.data)

    return{
      "success":true,
      "message":"Email verification completed successfully! Your account is now verified."
      
    }
  }


  @Post("login")

  @HttpCode(HttpStatus.OK)

async login (@Body() payload : LoginPayloadDto){


  const result=await this.authService.login(payload)

  return{
    "success":true
    ,
    "message":"User login success fully !",

    "data":{
      accessToken: result.accessToken,
      refeshToken:result.refeshToken
    }
  }
}


  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
