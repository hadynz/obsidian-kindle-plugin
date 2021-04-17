import KindleRepository from './KindleRepository';
import KindleServer from './KindleServer';

export default class KindleService {
  private kindleRepository: KindleRepository;
  private kindleServer: KindleServer;

  constructor() {
    this.kindleRepository = new KindleRepository();
    this.kindleServer = new KindleServer();
  }

  async login(): Promise<boolean> {
    await this.kindleServer.start();

    //const success = await this.kindleRepository.login();

    //await this.kindleServer.stop();

    return false;

    //return success;
  }
}
