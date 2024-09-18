import { Module } from '@nestjs/common';
import { DefaultService } from './default.service';
import { DefaultController } from './default.controller';
import { PrismaService } from 'src/prisma.service';
import { GeneralFunction } from 'src/general.service';

@Module({
  controllers: [DefaultController],
  providers: [DefaultService, PrismaService, GeneralFunction],
})
export class DefaultModule {}
