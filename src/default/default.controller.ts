/* eslint-disable prettier/prettier */
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
  @Get("Work_GetInfLogin")
  async Work_GetInfLogin(@Query ("isMobile") isMobile: boolean =false, @Query ("email") email:string) 
  {
      try{
        const result:any[]= await this.defaultService.work_PersonalProfiles(isMobile ===true ? ""  : email);
        
        if(result)
        {
          return JSON.stringify(result.at(0))
        }
      }
      catch{
        throw new HttpException("Error", HttpStatus.BAD_REQUEST)
      }
  }

  @Get("Work_Calendar")
  async Work_Calendar (@Query('date') date: string, @Query('title')  title:string,  @Query('projectName') projectName:string,  @Query('status') status:string, @Query('employee') employee:string, @Query('type') type:string)
  {

  }

}
