import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/auth/roles/roles.guard';
import { Roles } from 'src/guards/auth/roles/roles.decorator';
import { UserRole } from 'generated/prisma/enums';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @UseGuards(JwtAuthGuard,RolesGuard)

  @Roles(UserRole.ADMIN,UserRole.SUPER_ADMIN)

  @Post()
  @HttpCode(HttpStatus.CREATED)
 async create(@Body() createPlanDto: CreatePlanDto) {
 const result= await this.planService.create(createPlanDto);
    return {
"success":true,
"message":"plan create success fully  !",
"data":result
      
    }
  }

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.planService.update(+id, updatePlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planService.remove(+id);
  }
}
