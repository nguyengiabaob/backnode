import { Injectable } from '@nestjs/common';
import { CreateDefaultDto } from './dto/create-default.dto';
import { UpdateDefaultDto } from './dto/update-default.dto';
import { PrismaService } from 'src/prisma.service';
import { json } from 'express';
import { PersonalProfileView } from './model/PersonalProfileViewModel';

@Injectable()
export class DefaultService {
  constructor (private readonly prisma : PrismaService ) {}
  async work_getWorkStatusByProject (projectId: string) {
    
      const result1 = await this.prisma.$queryRaw<any[]>`EXEC Work_GetWorkStatusByProject ${projectId},''`;
      return result1;
      
  }
  async work_PersonalProfiles(email:string)
  {
    let resultQuery;
    if(!email)
    {
      resultQuery = this.prisma.$queryRaw<PersonalProfileView[]>`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1 `
    }
    else
    {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
      let check = emailRegex.test(email);
      if(!check)
      {
        return [];
      }
      resultQuery = this.prisma.$queryRaw<PersonalProfileView[]>`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1  and email=${email}`
    
    }
    return resultQuery ;
    // if(resultQuery)
    // {

    // }
    


  }

  findAll() {
    return `This action returns all default`;
  }

  findOne(id: number) {
    return `This action returns a #${id} default`;
  }

  update(id: number, updateDefaultDto: UpdateDefaultDto) {
    return `This action updates a #${id} default`;
  }

  remove(id: number) {
    return `This action removes a #${id} default`;
  }
}
