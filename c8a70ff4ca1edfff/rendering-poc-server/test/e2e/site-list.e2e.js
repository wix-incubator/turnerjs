import {SiteListDriver} from './drivers/site-list.driver';
import * as env from './../environment';

let siteListDriver;

beforeEach(() => {
  siteListDriver = new SiteListDriver(env);
});

describe('Site list', () => {
  it('should display sites using direct link (server side rendering)', () => {
    siteListDriver.given
      .siteListValidData()
      .when.navigate('/site-list');

    expect(siteListDriver.get.siteNameAt(0).getText()).toBe(siteListDriver.get.mockedSiteNameAt(0));
  });

  it('should display sites using client link (client side rendering)', () => {
    siteListDriver
      .given.siteListValidData()
      .when.navigate('/')
      .when.clientNavigateTo('site-list');

    expect(siteListDriver.get.siteNameAt(0).getText()).toBe(siteListDriver.get.mockedSiteNameAt(0));
  });
});
