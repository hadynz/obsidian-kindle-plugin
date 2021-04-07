import 'reflect-metadata';
import * as passport from 'passport';
import { createExpressServer } from 'routing-controllers';

import { KindleController } from './controllers/KindleController';
import GoodreadsStrategy from './passport/GoodreadsStrategy';

const port = 8080;

const app = createExpressServer({
  cors: true,
  controllers: [KindleController],
});

passport.use(GoodreadsStrategy);

// define a route handler for the default home page
app.get('/', (_req, res) => {
  res.send('Hello world!');
});

// start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
