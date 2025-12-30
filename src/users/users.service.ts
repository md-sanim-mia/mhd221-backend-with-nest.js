import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {

  constructor(private readonly prisma:PrismaService){

  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

 async findAll() {

    const result=await this.prisma.user.findMany({select:{fullName:true,email:true,id:true,country:true,storeName:true,isSubscribed:true,phone:true,profilePic:true,isVerified:true,role:true,lastActiveAt:true}})

    return result
  }

 async  findOne(id: string) {

    const result =await this.prisma.user.findFirst({where:{id},select:{fullName:true,email:true,id:true,country:true,storeName:true,isSubscribed:true,phone:true,profilePic:true,isVerified:true,role:true,lastActiveAt:true}})
    
    if(!result) {
      throw new NotFoundException("user not found !")
    }
    
    return result
  }

   async update(id:string, updateUserDto: UpdateUserDto) {

   const isExist =await this.prisma.user.findFirst({where:{id}})

     
    if(!isExist) {
      throw new NotFoundException("user not found !")
    }
       
    console.log("payload",updateUserDto)

    const update=await this.prisma.user.update({where:{id},data:updateUserDto})

    return update
  }

  async remove(id: string) {


   
   const isExist = await this.prisma.user.findFirst({where:{id}})

     
    if(!isExist) {
      throw new NotFoundException("user not found !")
    }
       
  const result=await this.prisma.user.delete({where:{id}})
      

  if(!result){
    throw new BadRequestException("file to delete user ")
  }
    return result
  }
}
