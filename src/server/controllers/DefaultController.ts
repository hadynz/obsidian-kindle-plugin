import * as passport from 'passport';
import { Response } from 'express';
import { Get, Res, JsonController } from 'routing-controllers';

@JsonController('/')
export class DefaultController {
  @Get('/')
  async default(@Res() response: Response) {
    response.send('Hello world!');
  }
}
