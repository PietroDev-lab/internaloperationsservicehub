import { Controller, Get, Post, Body, Param, Patch , Inject } from '@nestjs/common';
import { RequestsService, RequestStatus } from './requests.service';

@Controller('requests')
export class RequestsController {
    
constructor(
    @Inject(RequestsService) private readonly requestsService: RequestsService
  ) {}

  @Post()
  create(@Body() body: { type: string; description: string }) {
    return this.requestsService.create(body.type, body.description);
  }

  @Get()
  findAll() {
    return this.requestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.requestsService.getHistory(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RequestStatus; hrMessage?: string },
  ) {
    return this.requestsService.updateStatus(id, body.status, body.hrMessage);
  }
}
