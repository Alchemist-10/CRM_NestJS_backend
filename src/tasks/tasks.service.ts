import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

type AuthUser = { userId: number; role: 'ADMIN' | 'EMPLOYEE' };

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto) {
    const [assignedUser, customer] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.assignedTo },
        select: { id: true, role: true, name: true, email: true },
      }),
      this.prisma.customer.findUnique({
        where: { id: dto.customerId },
        select: { id: true },
      }),
    ]);

    if (!assignedUser) {
      throw new NotFoundException('Assigned user not found');
    }

    if (assignedUser.role !== 'EMPLOYEE') {
      // Spec says assignedTo must be EMPLOYEE; 404 only if not found.
      throw new BadRequestException('assignedTo must be an EMPLOYEE');
    }

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        assignedToId: dto.assignedTo,
        customerId: dto.customerId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }

  async findAllForUser(user: AuthUser) {
    const where =
      user.role === 'ADMIN' ? {} : { assignedToId: Number(user.userId) };

    return this.prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }

  async updateStatus(id: number, dto: UpdateTaskStatusDto, user: AuthUser) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, assignedToId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (user.role === 'EMPLOYEE' && task.assignedToId !== user.userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.task.update({
      where: { id },
      data: { status: dto.status },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });
  }
}
