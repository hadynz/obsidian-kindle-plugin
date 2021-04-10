import { BasicStrategy } from 'passport-http';
import { Request } from 'express';

import RequestContext from '../RequestContext';

export default new BasicStrategy(
  { passReqToCallback: true },
  async function (
    request: Request,
    username: string,
    password: string,
    done: any,
  ) {
    const ctx = RequestContext.get(request);

    try {
      const success = await ctx.goodreads.signin(username, password);
      return done(null, success);
    } catch (error) {
      return done(error);
    }
  },
);
