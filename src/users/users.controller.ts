import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/auth/roles/roles.guard';
import { UserRole } from 'generated/prisma/enums';
import { Roles } from 'src/guards/auth/roles/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
 @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
   async findAll() {
    const result=await this.usersService.findAll();

    return{
      "success":true,
      "message":"get all user success fully !",
      "data":result
    }
  }
 @UseGuards(JwtAuthGuard)
  @Get(':id')
 async findOne(@Param('id') id: string) {


  
   if(!id){
    throw new BadRequestException("usier id is required!")
   }

   const result= await this.usersService.findOne(id);

   return{
    "success":true,
    "message":"get single user with user id !",
     "data":result
   }
  }

 @UseGuards(JwtAuthGuard)
  @Patch("update-profile")

  @HttpCode(HttpStatus.OK)
  async update(@Req() req:Request & { user: any } , @Body() updateUserDto: UpdateUserDto) {
   
     const id =req.user.userId
     console.log(id)

     if(!id ){
    throw new BadRequestException("usier id is required!")
   }

    const result= await this.usersService.update(id, updateUserDto);

    
   return{
    "success":true,
    "message":"update single user with user !",
     "data":result
   }
  }

 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required!');
    }

    const result = await this.usersService.remove(id);

    return {
      success: true,
      message: 'User deleted successfully!',
      data: result
    };
  }

}
