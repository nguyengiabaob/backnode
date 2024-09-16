/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PersonalProfileView } from './model/PersonalProfileViewModel';
import { Prisma } from '@prisma/client';
import { CheckValidString } from 'common/generalFunction';
import { GeneralFunction } from 'src/general.service';
import dayjs from 'dayjs';

@Injectable()
export class DefaultService {
  constructor (private readonly prisma : PrismaService, private readonly generalService: GeneralFunction ) {}
  async work_getWorkStatusByProject (projectId: string) {
    
      const result1 = await this.prisma.$queryRaw<any[]>`EXEC Work_GetWorkStatusByProject ${projectId},''`;
      return result1;
      
  }

  async work_PersonalProfiles(email:string)
  {
    console.log('dada',email);
    let resultQuery: Prisma.PrismaPromise<PersonalProfileView[]>;
    if(!email)
    {
      resultQuery = this.prisma.$queryRaw<PersonalProfileView[]>`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1 `
    }
    else
    {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  
      const check = emailRegex.test(email);
      if(!check)
      {
        return [];
      }
    
      
      resultQuery = this.prisma.$queryRaw<PersonalProfileView[]>`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1  and email=${email}`
    
    }
    return resultQuery ;
  }

  async Work_Calendar ( date: string, title:string,   projectId:string,  status:string,  employee:string,  type:string) {
      if(CheckValidString(date + title + projectId + status + employee + type))
      {
        return null;
      }
      if(this.generalService.Work_CheckProjectRuleByUser(projectId))
      {
          const  userIdCurrent:string = this.generalService.GetCurrentUserLoginReturnId();
          
          let beginDay = "", endDay = "";
          if(!date)
          {
            date = dayjs().format("yyyy-MM-dd");
          }
          else
          {
            date =  dayjs(date).format("yyyy-MM-dd");
          }
        
          type = type ?? "";
          switch (type.toLowerCase()) {
            case "month":
                let days = dayjs(date).daysInMonth();
                beginDay= dayjs(dayjs(date).year()+ "-"+ dayjs(date).month()+ "-" + 1 ).format("yyyy-MM-dd");
                endDay= dayjs(dayjs(date).year()+ "-"+ dayjs(date).month()+ "-" + days ).format("yyyy-MM-dd");
              break;
            case "day":

            default:
              beginDay= date;
              endDay= date;
              break;
          }
      }
  }

}
