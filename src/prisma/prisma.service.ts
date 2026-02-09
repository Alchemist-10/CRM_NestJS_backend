// src/prisma/prisma.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load environment variables for local dev.
// Tries both current package `.env` and repo-root `.env`.
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.db_url ?? process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'Missing database connection string. Set `db_url` (or `DATABASE_URL`) in your environment.',
      );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
