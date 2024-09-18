/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PersonalProfile } from '@prisma/client';
import { env } from 'process';
import { WorkInfViewModel } from './default/model/WorkInfoViewModel';
import { PersonalProfileView } from './default/model/PersonalProfileViewModel';

@Injectable()
export class GeneralFunction {
  constructor(private readonly prisma: PrismaService) {}

  async Work_CheckProjectRuleByUser(projectId: string) {
    try {
      const userCurrent = await this.GetCurrentUserLogin();
      if (userCurrent) {
        const listUserAdmin = process.env.Admin_Page?.split(';').find(
          (item) => item === userCurrent.AccountName,
        );
        if (listUserAdmin) {
          return true;
        }
      }
      if (projectId) {
        const employee = 'P:' + userCurrent.Id.toString();
        const count = await this.prisma
          .$queryRaw`Work_CheckUserInProject ${projectId},${employee}`;
        if (count === 0) {
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async GetCurrentUserLogin() {
    try {
      const emailCurrent = this.GetCurrentEmailLogin();

      const userCurrent = await this.prisma.$queryRaw<
        PersonalProfile[]
      >`select * from PersonalProfile where email=${emailCurrent} and UserStatus <> -1`;

      if (userCurrent?.length > 0) {
        return userCurrent[0];
      }
    } catch (error) {
      return null;
    }
  }

  GetCurrentEmailLogin() {
    return 'vuongnq@vntt.com.vn';
  }

  async GetCurrentUserLoginReturnId() {
    const user = await this.GetCurrentUserLogin();
    console.log('user', user);

    if (user.Id) {
      return 'P:' + Number(user.Id).toString();
    }
  }

  FormatUserPartner(
    works: WorkInfViewModel[],
    userPartner: PersonalProfileView[],
  ) {
    const result: WorkInfViewModel[] = works.map((item) => {
      return {
        ...item,

        userPartner: userPartner.filter(
          (user) => user.workId.toString() === item.userWorkflowId,
        ),
      };
    });
    return result;
  }
}
