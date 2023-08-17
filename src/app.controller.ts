import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
// import {  CreateTransactionRequest } from './create-transaction-request.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log("inside the controller");
    return this.appService.getHello();
  }

}