define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('addComponent', function () {

        var originalTimeout;

        beforeAll(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 24000;
        });

        afterAll(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        describe('add comp', function () {
            it('should add a comp to a current page', function (done) {
                var msg = {
                    data: {
                        componentType: 'WIDGET',
                        widget: {
                            tpaWidgetId: 'grid_gallery',
                            allPages: false
                        }
                    }
                };
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.addComponent(appDefId, msg, function(widgetId) {
                    expect(widgetId).toBeDefined();
                    done();
                });
            });

            it('should return an error when adding a comp to a pageId not in the site', function (done) {
                var msg = {
                    data: {
                        componentType: 'WIDGET',
                        widget: {
                            wixPageId: 'foo-bar',
                            tpaWidgetId: 'grid_gallery',
                            allPages: false
                        }
                    }
                };
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.addComponent(appDefId, msg, function(error) {
                    expect(error.onError).toBe('pageId was not found.');
                    done();
                });
            });

            it('should add a comp to a different page', function (done) {
                var msg = {
                    data: {
                        componentType: 'WIDGET',
                        widget: {
                            wixPageId: 'woei9',
                            tpaWidgetId: 'grid_gallery',
                            allPages: false
                        }
                    }
                };
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.addComponent(appDefId, msg, function(widgetId) {
                    expect(widgetId).toBeDefined();
                    //checking if a new comp is added by calling an API on it
                    driver.getSiteInfo(widgetId).then(function (response) {
                        expect(response.pageTitle).toBe('Thank You Page');
                        done();
                    });
                });
            });
        });

        describe('add page', function () {
            it('should add a new eCom page', function (done) {
                var msg = {
                    data: {
                        componentType: 'PAGE',
                        page: {
                            pageId: 'product_gallery',
                            title: 'hxs0r'
                        }
                    }
                };
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.navigateToPage('c1dmp').then(function () {
                    driver.addComponent(appDefId, msg, function(sectionId) {
                        expect(sectionId).toBeDefined();
                        driver.getWidgetPageId(sectionId).then(function (pageId) {
                            expect(pageId).not.toBe('c1dmp');
                            done();
                        });
                    });
                });
            });

            it('should not add a new eCom page w/ wrong pageId', function (done) {
                var msg = {
                    data: {
                        componentType: 'PAGE',
                        page: {
                            pageId: 'thank_you_page',
                            title: 'hxs0r'
                        }
                    }
                };
                var appDefId = '1380b703-ce81-ff05-f115-39571d94dfcd';
                driver.addComponent(appDefId, msg, function(error) {
                    expect(error.onError).toBe('No page found.');
                    done();
                });
            });
        });
    });
});
