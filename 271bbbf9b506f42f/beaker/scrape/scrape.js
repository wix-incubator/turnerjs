var phantom = require('phantom');
var request = require('request');
var fs = require('fs');
var utils = require('./utils');

function scrapeHTML(url) {
    "use strict";

    return phantom
        .create()
        .then(function (ph) {
            console.log('opening phantom');
            return ph.createPage()
                .then(function (page) {
                    console.log('opening url ' + url);
                      return page.open(url)
                        .then(function () {
                            return page.evaluate(`
                                  function() {
                                    var metas = [].map.call(document.head.querySelectorAll('meta'), function(meta) {
                                      return { id: meta.getAttribute('id'), property: meta.getAttribute('property'), content: meta.getAttribute('content'), name: meta.getAttribute('name'), httpEquiv: meta.getAttribute('http-equiv') }
                                    });

                                    rendererModel.previewMode = true;

                                    return {
                                      rendererModel: rendererModel,
                                      publicModel: publicModel,
                                      serviceTopology: serviceTopology,
                                      adData: adData,
                                      mobileAdData: mobileAdData,
                                      metas: metas
                                    };
                                  }`
                            );
                        });
                })
                .then(function (wixSiteModel) {
                    ph.exit();
                    return wixSiteModel;
                });
        });
}

function saveJson(object, file, wrap) {
    "use strict";
    const json = JSON.stringify(object, null, 4);
    fs.writeFileSync(file, wrap ? `Object.assign(window, ${json});` : json);
    return Promise.resolve();
}

function scrape(url) {
    "use strict";

    function downloadSinglePage(urlToDownload) {
        return new Promise((resolve, reject) => {
            request({uri: urlToDownload, json: true}, (error, response, body) => {
                if (error) {
                    reject(error);
                }

                if (typeof body === "object") {
                    resolve(body);
                }

                reject("not json");
            });
        });
    }

    function download(pageName, urlList, tryCounter) {
        tryCounter = tryCounter || 0;

        if (!urlList.length) {
            console.log("Didn't got JSON of page " + pageName);
            return Promise.reject();
        }

        return downloadSinglePage(urlList[0]).then(function(body) {
            console.log("successful download from url " + tryCounter + " page: " + pageName);
            return Promise.resolve(body);
        }, function() {
            return download(pageName, urlList.splice(1), ++tryCounter);
        });
    }


    return scrapeHTML(url).then(function (wixSiteModel) {
        const pagesUrlList = wixSiteModel.publicModel.pageList;
        wixSiteModel.siteAsJson = {};
        var siteUrl = wixSiteModel.publicModel.externalBaseUrl;

        const masterPageUrls = utils.getMasterPageURLS(wixSiteModel);
        const masterPagePromise = download(siteUrl + ' masterpage', masterPageUrls).then(masterPage => {
            wixSiteModel.siteAsJson.masterPage = masterPage;
            return Promise.resolve();
        });

        wixSiteModel.siteAsJson.pages = [];

        const allPagesPromises = pagesUrlList.pages.map(page => {
            return download(siteUrl + " " + page.title, utils.getPageURLS(page, wixSiteModel)).then(pageData => {
                wixSiteModel.siteAsJson.pages.push(pageData);
                return Promise.resolve();
            });
        }).concat([masterPagePromise]);

        return Promise.all(allPagesPromises).then(() => {
                return Promise.resolve(wixSiteModel);
        });
    });
}


function scrapeAndSave(url, filename) {
    "use strict";
         return scrape(url).then((wixSiteModel) => {
            saveJson(wixSiteModel, filename, false);
            return Promise.resolve();
        });
}

module.exports = {
    scrapeAndSave,
    scrape
};
