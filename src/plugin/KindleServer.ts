import server from '../server';

export default class KindleServer {
  async start() {
    server.listen(8080, () => {
      console.log('Kindle server started on port 8080...');
    });
  }

  async stop() {
    server.close();
    console.log('Killed server');
  }
}
