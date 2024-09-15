import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DefaultService } from './default.service';
import { CreateDefaultDto } from './dto/create-default.dto';
import { UpdateDefaultDto } from './dto/update-default.dto';

@Controller('default')
export class DefaultController {
  constructor(private readonly defaultService: DefaultService) {}

  @Get("work_getallproject")
  async work_getallproject(@Query("multiProjectName") multiProjectName: string )
  {
      console.log('sdasdas',multiProjectName);
      
      let result:any[] = []
      let resultArray = multiProjectName.split(",");  
      for (let item in resultArray)
      { 
        let res=  await this.defaultService.work_getWorkStatusByProject(resultArray[item]);
        if(res)
        {
          result.push(...res);
        }
      }
    return JSON.stringify(result,(_,v)=>{  return  typeof v === 'bigint' ? v.toString() : v})
  }
  @Get("Work_GetInfLogin")
  async Work_GetInfLogin( isMobile: boolean) {
    
      try{
        let result = await this.defaultService.work_PersonalProfiles(isMobile ? ""  : "")
      }
      catch{

      }
  }


  @Get()
  findAll() {
    return this.defaultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.defaultService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDefaultDto: UpdateDefaultDto) {
    return this.defaultService.update(+id, updateDefaultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.defaultService.remove(+id);
  }
}
