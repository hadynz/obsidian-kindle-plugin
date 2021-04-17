import * as passport from 'passport';
import { Response } from 'express';
import { Get, Res, JsonController } from 'routing-controllers';

@JsonController('/')
export class DefaultController {
  @Get('/')
  async default(@Res() response: Response) {
    return response.send('Kindle server for Obsidian is running...');
  }
}
