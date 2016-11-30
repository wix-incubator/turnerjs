import uuidGenerator from 'uuid-support';

export class SiteListDriver {
  constructor(env) {
    this.env = env;
  }

  given = {
    siteListValidData: () => {
      this.sites = [
        {
          id: uuidGenerator.generate(),
          siteName: 'my cool site'
        }, {
          id: uuidGenerator.generate(),
          siteName: 'another cool site'
        }];
      this.env.addRpcHandler('ReadOnlyMetaSiteManager', 'listSites', (params, respond) => {
        respond({result: this.sites});
      });
      return this;
    }
  };

  when = {
    navigate: (path = '/') => {
      browser.get(this.env.app.getUrl(path));
      return this;
    },
    clientNavigateTo: linkHookName => {
      this.get.navigationLink(linkHookName).click();
      return this;
    }
  };

  get = {
    mockedSiteNameAt: index => this.sites[index].siteName,
    siteNameAt: index => {
      browser.wait(() => $(`[data-hook="site"]`).isPresent());
      return $$(`[data-hook="site"]`).get(index);
    },
    navigationLink: linkHookName => $$(`[data-hook="${linkHookName}-tab"]`)
  };
}
