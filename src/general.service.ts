/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Data_RESOURCEDA, Data_WORK, PersonalProfile } from '@prisma/client';
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

  async Work_CheckWorkRuleByUser(
    WorkId: string,
    IsCurrent: boolean,
    strResult: string,
  ) {
    if (!WorkId || WorkId?.toLowerCase() === 'underfined') {
      return '';
    }
    try {
      const email = this.GetCurrentEmailLogin();
      if (!email) {
        return 'none';
      }
      const work = await this.prisma
        .$queryRaw<Data_WORK>`select * from Dynamic.Data_WORK where UserWorkflowId=${WorkId}`;
      if (work) {
        const project = await this.prisma
          .$queryRaw<Data_RESOURCEDA>`select Id,UserWorkflowId,Ten,RuleViewWork from Dynamic.Data_RESOURCEDA where UserWorkflowId=${work.Duan} and ISNULL(IsDeleted,'False')='False'`;
        if (project) {
          const employeeId = await this.GetCurrentUserLoginReturnId();

          if (
            work.Nguoigiao &&
            work.Nguoigiao?.split(';').find((item) => item === employeeId)
          ) {
            return 'Full';
          }
          const AdminPage = 'vuongnq,admin';
          const user = await this.GetCurrentUserLogin();
          if (
            AdminPage.split(',').find((accName) => accName === user.AccountName)
          ) {
            return 'AdminFull';
          }

          if (IsCurrent) {
            const status = await this.prisma
              .$queryRaw<Data_WORK>`select * from Dynamic.Data_RESOURCETTFC where UserWorkflowId=${work.TrangThaiCongViec}`;

            if (!status) {
              if (status.TrangThaiCongViec.toLowerCase() === 'hoàn thành') {
                if (
                  work.Nguoigiao.split(';').find(
                    (item) => item === employeeId,
                  ) ||
                  work.Nguoixuly.split(';').find(
                    (item) => item === employeeId,
                  ) ||
                  work.Nguoiphoihop.split(';').find(
                    (item) => item === employeeId,
                  )
                ) {
                  return 'hoàn thành(logtime)';
                }
              }
            }
            const checkManager = await this.prisma
              .$queryRaw<boolean>`EXEC Work_CheckUserIsManager ${project.UserWorkflowId},${employeeId}`;

            if (checkManager) {
              return 'ManagerEdit';
            }

            if (project?.RuleViewWork.trim() == '1') {
              if (strResult === 'None' || strResult === '') {
                if (
                  await this.Work_CheckProjectRuleByUser(
                    project.UserWorkflowId.toString(),
                  )
                ) {
                  strResult = 'View';
                }
              }
            }

            if (work.Nguoixuly.split(';').find((item) => item === employeeId)) {
              return 'Edit';
            }

            if (
              work.Nguoitheodoi.split(';').find(
                (item) => item === employeeId,
              ) ||
              work.Nguoiphoihop.split(';').find(
                (item) => item === employeeId,
              ) ||
              work.NguoiXuLyDauTien.split(';').find(
                (item) => item === employeeId,
              )
            ) {
              return 'EditView';
            }
          }

          if (strResult.toLowerCase() === 'none') {
            const ruleViewProject = await this.prisma
              .$queryRaw<number>`Exec Work_RuleViewProject ${work.Duan},${employeeId}`;

            if (
              ruleViewProject > 0 ||
              work.Nguoitheodoi.split(';').find(
                (item) => item === employeeId,
              ) ||
              work.Nguoiphoihop.split(';').find((item) => item === employeeId)
            ) {
              strResult = 'View';
            }
            if (
              work.Nguoigiao.split(';').find((item) => item === employeeId) ||
              work.Nguoixuly.split(';').find((item) => item === employeeId)
            ) {
              strResult = 'Edit';
            }

            if (work.CongViecCha) {
              strResult = await this.Work_CheckWorkRuleByUser(
                work.CongViecCha,
                false,
                strResult,
              );
            }
          }
        }
      }
    } catch (error) {
      return undefined;
    }

    if (!strResult && strResult.toLowerCase() === 'none') {
      const employeeId = await this.GetCurrentUserLoginReturnId();
      const check = await this.prisma
        .$queryRaw`EXEC Work_CheckAllowWorkChildViewParent ${WorkId},${employeeId}`;

      if (check) {
        return 'View';
      }
    }
    return strResult;
  }
}
