import { Request } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { PuppeteerGoodreads } from 'puppeteer-goodreads';

import RequestContext from '../RequestContext';

export class GoodreadsMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: any, next: (err?: any) => any): any {
    const ctx = RequestContext.get(request);

    // At the start of every request
    ctx.goodreads = new PuppeteerGoodreads({
      puppeteer: { headless: true },
    });

    // At the end of every request
    response.on('finish', function () {
      ctx.goodreads.close();
    });

    next();
  }
}
