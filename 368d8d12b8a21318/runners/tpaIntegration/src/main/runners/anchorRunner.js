define(['lodash', 'zepto', 'tpaIntegration/driver/driver', 'bluebird', 'jasmine-boot'], function (_, $, driver, Promise) {
    'use strict';

    describe('get Anchors', function(){
        it('should return the top page anchor by default', function(done){
            var pageId = 'cjg9';
            driver.navigateToPage(pageId);
            driver.waitForDomElement('#cjg9', 5, 1000, 'failed to navigate to page cf5y')
                .then(function(){
                    driver.getCurrentPageAnchors(function(anchors){
                        expect(anchors.length).toBe(1);
                        expect(anchors[0]).toEqual({id: 'PAGE_TOP_ANCHOR', title: 'TOP_PAGE_' + pageId});
                        done();
                    });
                });
        });

        it('should return the current page anchors', function(done){
            driver.navigateToPage('cf5y');
            driver.waitForDomElement('#cf5y', 5, 1000, 'failed to navigate to page cf5y')
                .then(function(){
                    var urlPageId = driver.getCurrentPageId();
                    driver.getCurrentPageAnchors(function(anchors){
                        expect(anchors.length).toBe(2);
                        expect(anchors[0]).toEqual({id: 'PAGE_TOP_ANCHOR', title: 'TOP_PAGE_' + urlPageId});
                        expect(anchors).toContain({id: 'comp-ihan3ubr', title: 'bottom anchor'});
                        done();
                    });
                });
        });
    });

    describe('navigate to anchor', function(){
        it('should get anchors and navigate to anchor on the current page', function(done){
            var anchorComp;
            driver.navigateToPage('ktdom');
            driver.waitForDomElement('#ktdom', 5, 1000, 'failed to navigate to page ktdom')
                .then(function(){
                    return new Promise(function(resolve){
                        driver.getCurrentPageAnchors(function(anchors){
                            resolve(anchors[1].id);
                        });
                    });
                })
                .then(function(anchorId){
                    driver.navigateToAnchor(anchorId);
                    anchorComp = $('#' + anchorId)[0];
                    return driver.waitForCondition(driver.isAnchorInViewport.bind(null, anchorComp), 'anchor is not in view port');
                })
                .then(function(){
                    expect(driver.isAnchorInViewport(anchorComp)).toBe(true);
                    done();
                });
        });

        it('should navigate to anchor on then navigate to top page anchor', function(done){
            var anchorsData, anchorComp;
            driver.navigateToPage('cf5y');
            driver.waitForDomElement('#cf5y', 5, 1000, 'failed to navigate to page cf5y')
                .then(function(){
                    return new Promise(function(resolve){
                        driver.getCurrentPageAnchors(function(anchors){
                            anchorsData = anchors;
                            resolve(anchors[1].id);
                        });
                    });
                })
                .then(function(anchorId){
                    driver.navigateToAnchor(anchorId);
                    anchorComp = $('#' + anchorId)[0];
                    return driver.waitForCondition(driver.isAnchorInViewport.bind(null, anchorComp), 'anchor is not in view port');
                })
                .then(function(){
                    expect(driver.isAnchorInViewport(anchorComp)).toBe(true);
                    return anchorsData[0].id;
                })
                .then(function(anchorId){
                    driver.navigateToAnchor(anchorId);
                    return driver.waitForCondition(function(){
                        return window.pageYOffset === 0;
                    }, 'anchor is not in view port');
                })
                .then(function(){
                    expect(window.pageYOffset).toBe(0);
                    done();
                })
            ;
        });

        it('should call the onFailure callback if the anchor does not exist on the current page', function(done){
            var onFailure = jasmine.createSpy('onFailure');
            driver.navigateToPage('ktdom');
            driver.waitForDomElement('#ktdom', 5, 1000, 'failed to navigate to page ktdom')
                .then(function(){
                    driver.navigateToAnchor("comp-ihan3ubr", onFailure);
                    expect(onFailure).toHaveBeenCalled();
                    done();
                });
        });
    });

});
