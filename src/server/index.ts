import 'reflect-metadata';
import passport from 'passport';
import { createExpressServer } from 'routing-controllers';

import { DefaultController, KindleController } from './controllers';
import GoodreadsStrategy from './passport/GoodreadsStrategy';

const app = createExpressServer({
  cors: true,
  controllers: [DefaultController, KindleController],
});

passport.use(GoodreadsStrategy);

export default app;
