/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Data_RESOURCEDA, PersonalProfile, Prisma } from '@prisma/client';
import { CheckValidString } from 'common/generalFunction';
import { GeneralFunction } from 'src/general.service';
import dayjs from 'dayjs';
import { PersonalProfileView } from './model/PersonalProfileViewModel';
import { WorkInfViewModel } from './model/WorkInfoViewModel';
import { FilterOptionViewModel } from './model/FilterOptionViewModel';
import { ResultFilterOptionViewModel } from './model/ResultFilterOptionViewModel';
import {
  GeneralReportViewModel,
  ReportChartViewModel,
} from './model/GeneralReportViewModel';
import { TypeSort } from './model/ETypeSort';

@Injectable()
export class DefaultService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generalService: GeneralFunction,
  ) {}
  async work_getWorkStatusByProject(projectId: string) {
    const result1 = await this.prisma.$queryRaw<
      any[]
    >`EXEC Work_GetWorkStatusByProject ${projectId},''`;
    return result1;
  }

  async work_PersonalProfiles(email: string) {
    let resultQuery: Prisma.PrismaPromise<PersonalProfile[]>;
    if (!email) {
      resultQuery = this.prisma.$queryRaw<
        PersonalProfile[]
      >`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1 `;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const check = emailRegex.test(email);
      if (!check) {
        return [];
      }

      resultQuery = this.prisma.$queryRaw<
        PersonalProfile[]
      >`Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1  and email=${email}`;
    }
    return resultQuery;
  }

  async Work_Calendar(
    date: string,
    title: string,
    projectId: string,
    status: string,
    employee: string,
    type: string,
  ) {
    if (CheckValidString(date + title + projectId + status + employee + type)) {
      return null;
    }
    if (this.generalService.Work_CheckProjectRuleByUser(projectId)) {
      const userIdCurrent: string =
        await this.generalService.GetCurrentUserLoginReturnId();
      employee = userIdCurrent;
      let beginDay = '',
        endDay = '';
      if (!date) {
        date = dayjs().format('yyyy-MM-dd');
      } else {
        date = dayjs(date).format('yyyy-MM-dd');
      }
      type = type ?? '';
      switch (type.toLowerCase()) {
        case 'month':
          beginDay = dayjs(
            dayjs(date).year() + '-' + dayjs(date).month() + '-' + 1,
          ).format('yyyy-MM-dd');
          endDay = dayjs(
            dayjs(date).year() +
              '-' +
              dayjs(date).month() +
              '-' +
              dayjs(date).daysInMonth(),
          ).format('yyyy-MM-dd');
          break;
        case 'day':
        default:
          beginDay = date;
          endDay = date;
          break;
      }
      const project = await this.prisma
        .$queryRaw<Data_RESOURCEDA>`select Id,UserWorkflowId,RuleViewWork from Dynamic.Data_RESOURCEDA  where UserWorkflowId=${projectId} and ISNULL(IsDeleted,'False')='False'`;
      if (project && project.RuleViewWork) {
        employee = employee ?? '';
      } else {
        const result = await this.prisma.$queryRaw<
          PersonalProfileView[]
        >`Work_ProjectGetPersonInf ${projectId},"Quanly"`;

        if (result.length > 0) {
          if (result.find((item) => item.id === userIdCurrent)) {
            employee = employee ?? '';
          }
        }
      }

      const resultQuery = this.prisma
        .$queryRaw<WorkInfViewModel>`Work_Calendar ${beginDay},${employee},${title == null ? '' : title},${projectId},${status == null ? '' : status},${endDay}`;

      return resultQuery;
    } else {
      return [];
    }
  }

  async Work_GetAllByProject(
    projectId: string,
    type: string,
    title: string,
    status: string,
    layout: number,
    _pageNumber?: number,
    _rowNumber?: number,
  ) {
    if (
      CheckValidString(
        projectId ?? '' + type ?? '' + title ?? '' + status ?? '',
      )
    ) {
      return [];
    }
    const checkManager = await this.Work_CheckManagerProjectOrRuleView(
      projectId,
      false,
    );
    const employee = await this.generalService.GetCurrentUserLoginReturnId();

    const resultQuery = await this.prisma.$queryRaw<
      WorkInfViewModel[]
    >`Work_GetByCondition ${title ?? ''}, ${projectId ?? ''},'', ${status ?? ''}, ${checkManager ? '' : employee},0, ${employee ?? ''} `;
    return resultQuery;
  }
  async Work_CheckManagerProjectOrRuleView(
    projectId: string,
    isOnlyCheckManager: boolean,
  ) {
    try {
      const employee: string =
        await this.generalService.GetCurrentUserLoginReturnId();

      const project = await this.prisma
        .$queryRaw<Data_RESOURCEDA>`select * from Dynamic.Data_RESOURCEDA where UserWorkflowId={${projectId}}`;
      let check: boolean = false;

      if (project) {
        check = await this.prisma
          .$queryRaw<boolean>`Work_CheckUserIsManager ${projectId},${employee}`;

        if (isOnlyCheckManager) {
          return check;
        } else {
          if (!check) {
            if (project.RuleViewWork == '1') {
              check = true;
            }
          }
        }
        const listComment = await this.prisma
          .$queryRaw<number>`Work_RuleViewProject ${projectId}, ${employee}`;

        if (listComment > 0) {
          check = true;
        }
        return check;
      }
    } catch {
      return false;
    }
  }

  async Work_GetWorkChild(WorkflowId: string) {
    if (CheckValidString(WorkflowId ?? '')) {
      return [];
    }
    let work = await this.prisma.$queryRaw<
      WorkInfViewModel[]
    >`Work_GetWorkChild ${WorkflowId}`;
    if (work) {
      const listId = work.map((item) => item.id);

      const listUsers = await this.prisma.$queryRaw<
        PersonalProfileView[]
      >`Work_GetPersonInf ${listId}`;

      if (listUsers) {
        work = this.generalService.FormatUserPartner(work, listUsers);
      }
      return work;
    }
  }

  async Work_KanbanGetInf(title: string, projectId: string, employee: string) {
    try {
      const option: FilterOptionViewModel = {
        title: title,
        projectId: projectId,
        group: '',
        status: '',
        employee: '',
        projectType: '',
        fromDateBegin: '',
        fromDateEnd: '',
        toDateBegin: '',
        toDateEnd: '',
        dateCompeleteBegin: '',
        dateCompeleteEnd: '',
        isWorkRepeat: '',
        groupProject: '',
      };
      const result = await this.Work_FuntionGetWorkGeneral(option);
      if (result.listWorkByProjectGeneral) {
        return result.listWorkByProjectGeneral;
      }
    } catch (error) {
      return new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async Work_FuntionGetWorkGeneral(data: FilterOptionViewModel) {
    let TotalWorkInProject = undefined;
    let TotalWorkParentMaxRoot = undefined;
    if (data) {
      const str =
        (data.title ?? '') +
        (data.projectId ?? '') +
        (data.group ?? '') +
        (data.status ?? '') +
        (data.employee ?? '') +
        (data.projectType ?? '') +
        (data.fromDateBegin ?? '') +
        (data.fromDateEnd ?? '') +
        (data.toDateBegin ?? '') +
        (data.toDateEnd ?? '') +
        (data.dateCompeleteBegin ?? '') +
        (data.dateCompeleteEnd ?? '') +
        (data.groupProject ?? '');

      if (
        !data.isWorkRepeat ||
        CheckValidString(str) ||
        !(await this.generalService.Work_CheckProjectRuleByUser(data.projectId))
      ) {
        throw new HttpException('Error', HttpStatus.BAD_REQUEST);
      }
      const pageNumber = data._pageNumber ?? 0;
      const rowNumber = data._rowNumber ?? 100;
      const employeeLogin =
        await this.generalService.GetCurrentUserLoginReturnId();
      const onlyGetParent = 'True';
      const checkManager = await this.Work_CheckManagerProjectOrRuleView(
        data.projectId,
        false,
      );
      TotalWorkInProject = this.prisma
        .$queryRaw`select COUNT(id) as Dem from [Dynamic].Data_WORK a where a.Duan = ${data.projectId} and ISNULL(a.IsActive,'True')='True'`;
      if (checkManager == false) {
        data.employee = employeeLogin;
      }
      TotalWorkParentMaxRoot = this.prisma
        .$queryRaw`select COUNT(*) as Dem from (select  a.UserWorkflowId  
        from [Dynamic].Data_WORK a inner join [Dynamic].Data_WORK b on a.UserWorkflowId=b.CongViecCha 
        where a.Duan =${data.projectId} and ISNULL(a.IsActive,'True')='True' and ISNULL(a.CongViecCha,'')='' and ISNULL(b.IsActive,'True')='True' group by a.UserWorkflowId) a`;

      const filteredList = await this.prisma
        .$queryRaw<WorkInfViewModel>`Work_GetByCondition ${data.title ?? ''}, ${data.projectId ?? ''},${data.group ?? ''}, ${data.status ?? ''}, ${data.employee ?? ''}, 0,${employeeLogin ?? ''},${data.projectType ?? ''}, ${data.fromDateBegin ?? ''}, ${data.toDateEnd ?? ''},${data.dateCompeleteBegin ?? ''},${data.dateCompeleteEnd ?? ''}, ${data.isWorkRepeat},${onlyGetParent},${data.groupProject ? '' : data.groupProject}`;

      const result: ResultFilterOptionViewModel = {
        listWorkByProjectGeneral: filteredList,
        totalWorkInProject: TotalWorkInProject,
        totalWorkParentMaxRoot: TotalWorkParentMaxRoot,
      };
      return result;
    }
    const result: ResultFilterOptionViewModel = {
      listWorkByProjectGeneral: null,
      totalWorkInProject: 0,
      totalWorkParentMaxRoot: 0,
    };
    return result;
  }

  async Work_ReportChartByUserLogin(projectId: string, projectType: string) {
    try {
      if (CheckValidString((projectId ?? '') + (projectType ?? ''))) {
        const newReport: GeneralReportViewModel = {
          TopChart: [],
          PieChart: [],
        };
        return newReport;
      }
      const newReportCustom: GeneralReportViewModel = {
        TopChart: [],
        PieChart: [],
      };
      const emailCurrent = this.generalService.GetCurrentEmailLogin();
      newReportCustom.TopChart.concat(
        await this.prisma.$queryRaw<
          ReportChartViewModel[]
        >`Work_ReportChartByUserLogin ${emailCurrent}, ${projectId},""`,
      );

      newReportCustom.PieChart.concat(
        await this.prisma.$queryRaw<
          ReportChartViewModel[]
        >`Work_StatusReportChartByUserLogin ${emailCurrent}`,
      );
      return newReportCustom;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  async Work_ReportChartByProject(projectId: string) {
    const generalReport: GeneralReportViewModel = {
      PieChart: [],
      TopChart: [],
    };

    const email = this.generalService.GetCurrentEmailLogin();
    if (await this.generalService.Work_CheckProjectRuleByUser(projectId)) {
      try {
        generalReport.TopChart = await this.prisma.$queryRaw<
          ReportChartViewModel[]
        >`Work_ReportChartByProject ${email}, ${projectId}`;

        generalReport.PieChart = await this.prisma.$queryRaw<
          ReportChartViewModel[]
        >`Work_GetWorkStatusByProject ${projectId},''`;
      } catch (error) {
        return null;
      }
      return generalReport;
    }
  }
  async Work_UpdateJsonData(
    userWorkFlowId: string,
    fileName: string,
    value: string,
    tableName: string,
  ) {
    try {
      if (tableName === '[Dynamic].Workflow_WORK') {
        let result = 'None';
        result = await this.generalService.Work_CheckWorkRuleByUser(
          userWorkFlowId,
          true,
          result,
        );
        if (result.toLowerCase() == 'none') {
          return false;
        }
        await this.prisma
          .$queryRaw`EXEC Work_UpdateJsonData ${userWorkFlowId},${fileName},${value},${tableName}`;
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  async Work_Timeline(
    title: string,
    projectName: string,
    group: string,
    status: string,
    employee: string,
  ) {
    if (
      CheckValidString(
        (title ?? '') +
          (projectName ?? '') +
          (group ?? '') +
          (status ?? '') +
          (employee ?? ''),
      )
    ) {
      let workinfor: WorkInfViewModel[];
      return workinfor;
    }
    return await this.prisma.$queryRaw`EXEC Work_Timeline `;
  }

  async Work_PersonalProfiles(email: string) {
    if (CheckValidString(email)) {
      return [];
    }
    let sql = `Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1`;
    if (email) {
      sql = `Select 'P:'+ ltrim(rtrim( str(Id))) as Id, AccountName,Name,FullName,Email from [dbo].[PersonalProfile] where UserStatus <> -1 and email=${email}`;
    }

    let result = await this.prisma.$queryRaw<
      PersonalProfileView[]
    >`${Prisma.sql([sql])}`;

    if (email && result) {
      const AdminPage = 'vuongnq,admin';
      result = result
        .filter((item) => AdminPage.includes(item.accountName))
        .map((acc) => {
          return {
            ...acc,
            default: true,
          };
        });
    }
    return result;
  }

  async Work_GetWorkInProcess(
    title: string,
    projectName: string,
    status: string,
    employee: string,
    type: string,
    isComplete: number,
    layout: number,
    group: string,
    _pageNumber?: number,
    _rowNumber?: number,
    projectType: string,
    typeSort: TypeSort,
  ) {
    let emp = await this.generalService.GetCurrentUserLoginReturnId();
    let result: WorkInfViewModel[];
    const pageNumber = _pageNumber ?? 0;
    const rowNumber = _rowNumber ?? 100;
    title = title ? title : '';
    projectName = projectName ? projectName : '';
    group = group ? group : '';
    status = status ? status : '';
    employee = employee ? employee : emp;
    type = type ? type : '';
    projectType = projectType ? projectType : '';

    if (
      CheckValidString(
        title + projectName + group + status + employee + type + projectType,
      )
    ) {
      return [];
    }
    if (type || type.toLowerCase() === 'xử lý') {
      result = await this.prisma.$queryRaw<
        WorkInfViewModel[]
      >`Work_GetWorkByTypeInput ${title},${projectName},${group},${status},${employee},${isComplete},"","",true,${type}`;
    } else {
      result = await this.prisma.$queryRaw<
        WorkInfViewModel[]
      >`Work_GetByCondition ${title},${projectName},${group},${status},${employee},${isComplete},"","",false,${type}`;
    }
    try {
      if (layout == 1) {
        let totalPage = (result.length / rowNumber).toFixed();
        let totalWork = result.length;
        switch (typeSort) {
          case TypeSort.Index:
          case TypeSort.Lastest:
            break;

          default:
            break;
        }
      }
    } catch (error) {}
  }
}
