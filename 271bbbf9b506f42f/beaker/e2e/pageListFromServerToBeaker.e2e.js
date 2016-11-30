'use strict';

var scraper = require('../scrape/scrape');
var _ = require('lodash');

describe('pageListNewFormat experiment', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    it('should create the same pages data in site json if the experiemnt is on ', (done) => {
        scraper.scrape('http://alissav.wix.com/it-navigation').then((wixSiteModel) => {
            this.pages = wixSiteModel.siteAsJson.pages;
            scraper.scrape('http://alissav.wix.com/it-navigation').then((wixSiteModelWithexperiment) => {
                this.pagesWithExperiment = wixSiteModelWithexperiment.siteAsJson.pages;
                expect(_.sortBy(this.pages, 'pageUriSEO')).toEqual(_.sortBy(this.pagesWithExperiment, 'pageUriSEO'));
                done();
            })
                .catch((e)=> {
                    console.log(e);
                });
        });
    });
});
