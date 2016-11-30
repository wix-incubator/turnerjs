import reqOptions from 'wix-req-options';
import fetch from 'isomorphic-fetch';
import uuidGenerator from 'uuid-support';

export class MetasiteDriver {
  given = {
    listSiteData: () => {
      this.sessionOpts = reqOptions.builder()
        .withSession();

      this.metaSiteId = uuidGenerator.generate();
      this.siteName = 'my cool site';
      this.env.addRpcHandler('ReadOnlyMetaSiteManager', 'listSites', (params, respond) => {
        respond({result: [{id: this.metaSiteId, siteName: this.siteName}]});
      });
      return this;
    }
  };

  when = {
    listMetasites: () => {
      return fetch(this.env.app.getUrl(`/sites`), this.sessionOpts.options())
        .then(res => {
          return res.json();
        });
    }
  };

  get = {
    metaSiteId: () => this.metaSiteId,
    siteName: () => this.siteName,
    sessionOpts: () => this.sessionOpts
  };

  env;

  constructor(env) {
    this.env = env;
  }
}
