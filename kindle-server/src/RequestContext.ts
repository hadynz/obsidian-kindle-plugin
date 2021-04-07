import { Request } from 'express';
import { PuppeteerGoodreads } from 'puppeteer-goodreads';

export default class RequestContext {
  static _bindings = new WeakMap<Request, RequestContext>();

  public goodreads: PuppeteerGoodreads;

  constructor() {}

  static get(req: Request): RequestContext {
    let ctx = RequestContext._bindings.get(req);

    if (!ctx) {
      ctx = new RequestContext();
      RequestContext._bindings.set(req, ctx);
    }

    return ctx;
  }
}
