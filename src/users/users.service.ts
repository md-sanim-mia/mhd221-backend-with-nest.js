import { Injectable } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
