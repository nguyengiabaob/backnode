import { Module } from '@nestjs/common';
import { DefaultService } from './default.service';
import { DefaultController } from './default.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DefaultController],
  providers: [DefaultService,PrismaService],
})
export class DefaultModule {}
