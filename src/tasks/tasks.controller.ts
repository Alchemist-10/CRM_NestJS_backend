import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt_auth_guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

type AuthUser = { userId: number; role: 'ADMIN' | 'EMPLOYEE' };
type AuthedRequest = Request & { user: AuthUser };

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  findAll(@Req() req: AuthedRequest) {
    return this.tasksService.findAllForUser(req.user);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'EMPLOYEE')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskStatusDto,
    @Req() req: AuthedRequest,
  ) {
    return this.tasksService.updateStatus(id, dto, req.user);
  }
}
