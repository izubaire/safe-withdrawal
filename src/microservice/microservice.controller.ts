import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class MicroserviceController {
  @GrpcMethod('AppController', 'GetData')
  getData(data: any): any {
    return { message: `Hello, ${data.name}!` };
  }
}
