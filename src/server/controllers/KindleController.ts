import passport from 'passport';
import { Request } from 'express';
import {
  Get,
  Post,
  Req,
  BodyParam,
  JsonController,
  UseBefore,
} from 'routing-controllers';

import RequestContext from '../RequestContext';
import { GoodreadsMiddleware } from '../middleware/GoodreadsMiddleware';
import { Book } from 'puppeteer-goodreads';

@JsonController('/kindle')
@UseBefore(passport.authenticate('basic', { session: false }))
@UseBefore(GoodreadsMiddleware)
export class KindleController {
  @Get('/login')
  async login() {
    return true;
  }

  @Get('/books')
  async getBooks(@Req() request: Request) {
    const ctx = RequestContext.get(request);
    return await ctx.goodreads.getMyBooks();
  }

  @Post('/books/highlights')
  async getBookHighlights(
    @Req() request: Request,
    @BodyParam('bookUrl', { required: true }) bookUrl: string,
  ) {
    const book: Book = {
      bookUrl,
      asin: '',
      title: '',
      author: '',
      imageUrl: '',
    };

    const ctx = RequestContext.get(request);
    return await ctx.goodreads.getBookHighlights(book);
  }
}
