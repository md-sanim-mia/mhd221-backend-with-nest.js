import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {

 @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  storeName: string;
 @IsOptional()
  @IsString()
  phone: string;
 @IsOptional()
  @IsString()
  country: string;
  
  @IsOptional()
  @IsString()
   profilePic :string    
}
