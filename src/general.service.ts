/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { PersonalProfile } from "@prisma/client";
import { env } from "process";


@Injectable()
export class GeneralFunction {
    constructor(private readonly prisma: PrismaService){}

    async Work_CheckProjectRuleByUser(projectId:string){
      try {
        const userCurrent = await this.GetCurrentUserLogin();
        if(userCurrent)
        {
            const listUserAdmin = process.env.Admin_Page?.split(";").find((i)=> i === userCurrent.AccountName);
            if(listUserAdmin)
            {
               return true ;
            }
        }
        if (projectId)
        {

            const employee = "P:" + userCurrent.Id.toString();
            const count = await this.prisma.$queryRaw`Work_CheckUserInProject ${projectId},${employee}`;
            if(count === 0)
            {
                return false;
            }
            return true;
        }
        return false
      } catch (error) {
        
        return false
      }
    }


    GetCurrentUserLogin ()
    {
        try {
          const emailCurrent = this.GetCurrentEmailLogin();
          const userCurrent = this.prisma.$queryRaw<PersonalProfile>`select * from PersonalProfile where email=${emailCurrent} and UserStatus <> -1`;
          if(userCurrent)
          {
            return userCurrent;
          }
        } catch (error) {
            return null
        }
    }

    async GetCurrentEmailLogin ()
    {
        return "vuongnq@vntt.com.vn"
    }

    async GetCurrentUserLoginReturnId ()
    {
        const user =this.GetCurrentUserLogin();
        if(user)
        {
            return "P:" +  (await user).Id.toString();
        }
    }
}