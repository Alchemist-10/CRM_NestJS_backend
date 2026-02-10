import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from '../../../generated/prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  assignedTo: number;

  @IsInt()
  customerId: number;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
