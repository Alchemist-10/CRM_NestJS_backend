import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
      select: { email: true, phone: true },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email already in use');
      }
      if (existing.phone === dto.phone) {
        throw new ConflictException('Phone already in use');
      }
      throw new ConflictException('Duplicate customer');
    }

    return this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
      },
    });
  }

  async findAll(page = 1, limit = 10) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const skip = (safePage - 1) * safeLimit;

    const [totalRecords, data] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.findMany({
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / safeLimit);

    return {
      page: safePage,
      limit: safeLimit,
      totalRecords,
      totalPages,
      data,
    };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Customer not found');

    if (dto.email || dto.phone) {
      const or = [] as Array<{ email?: string; phone?: string }>;
      if (dto.email) or.push({ email: dto.email });
      if (dto.phone) or.push({ phone: dto.phone });

      const duplicate = await this.prisma.customer.findFirst({
        where: {
          id: { not: id },
          OR: or,
        },
        select: { email: true, phone: true },
      });

      if (duplicate) {
        if (dto.email && duplicate.email === dto.email) {
          throw new ConflictException('Email already in use');
        }
        if (dto.phone && duplicate.phone === dto.phone) {
          throw new ConflictException('Phone already in use');
        }
        throw new ConflictException('Duplicate customer');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Customer not found');

    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted' };
  }
}
