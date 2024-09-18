import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { DefaultService } from './default.service';

@Controller('default')
export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  @Get('work_getallproject')
  async work_getallproject(
    @Query('multiProjectName') multiProjectName: string,
  ) {
    console.log('sdasdas', multiProjectName);
    const result: any[] = [];
    const resultArray = multiProjectName.split(',');
    for (const item in resultArray) {
      const res = await this.defaultService.work_getWorkStatusByProject(
        resultArray[item],
      );
      if (res) {
        result.push(...res);
      }
    }
    return JSON.stringify(result, (_, v) => {
      return typeof v === 'bigint' ? v.toString() : v;
    });
  }
  @Get('Work_GetInfLogin')
  async Work_GetInfLogin(
    @Query('isMobile') isMobile: boolean = false,
    @Query('email') email: string,
  ) {
    try {
      const result: any[] = await this.defaultService.work_PersonalProfiles(
        isMobile === true ? '' : email,
      );

      if (result) {
        return JSON.stringify(result.at(0));
      }
    } catch {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('Work_Calendar')
  async Work_Calendar(
    @Query('date') date: string,
    @Query('title') title: string,
    @Query('projectName') projectName: string,
    @Query('status') status: string,
    @Query('employee') employee: string,
    @Query('type') type: string,
  ) {
    try {
      const result = await this.defaultService.Work_Calendar(
        date,
        title,
        projectName,
        status,
        employee,
        type,
      );
      if (result) {
        return JSON.stringify(result);
      }
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    } catch {
      throw new HttpException('Error', HttpStatus.BAD_REQUEST);
    }
  }
  @Get('Work_GetAllByProject')
  async Work_GetAllByProject(
    @Query('projectId') projectId: string,
    @Query('type') type: string,
    @Query('title') title: string,
    @Query('status') status: string,
    @Query('layout') layout: number,
    @Query('pageNumber') pageNumber?: number,
    @Query('rowNumber') rowNumber?: number,
  ) {
    const result = await this.defaultService.Work_GetAllByProject(
      projectId,
      type,
      title,
      status,
      layout,
      pageNumber,
      rowNumber,
    );

    if (!result) return new HttpException('Error', HttpStatus.BAD_REQUEST);
    return JSON.stringify(result, (_, v) => {
      return typeof v === 'bigint' ? v.toString() : v;
    });
  }

  //chưa test
  @Get('Work_GetWorkChild')
  async Work_GetWorkChild(workflowId: string) {
    const result = await this.defaultService.Work_GetWorkChild(workflowId);

    if (result) {
      return JSON.stringify(result, (_, v) => {
        return typeof v === 'bigint' ? v.toString() : v;
      });
    }
  }
  @Get('Work_KanbanGetInf')
  async Work_KanbanGetInf(
    title: string,
    projectName: string,
    employee: string,
  ) {
    const result = await this.defaultService.Work_KanbanGetInf(
      title,
      projectName,
      employee,
    );

    if (result) {
      return JSON.stringify(result, (_, v) => {
        return typeof v === 'bigint' ? v.toString() : v;
      });
    }
  }
  @Get('Work_ReportChartByUserLogin')
  async Work_ReportChartByUserLogin(projectId: string, projectType: string) {
    const result = await this.defaultService.Work_ReportChartByUserLogin(
      projectId,
      projectType,
    );
    if (result) {
      return result;
    }
    return new HttpException('Error', HttpStatus.BAD_REQUEST);
  }
}
