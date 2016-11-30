define(['jquery', 'tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function ($, driver) {
    'use strict';

    describe('password protected pages runner', function () {
        describe('migration', function () {
            it('should remove hashed password from protected page data', function () {
                var pageData = window.rendered.editorAPI.documentServices.pages.data.get('a4dia');
                expect(pageData.pageSecurity.passwordDigest).not.toBeDefined();
            });

            /*
            it('should add migrated pages hashed password to renderedModal.pageToHashedPassword', function () {
                var protectedPageId = 'a4dia';
                var hahsedPassword = 'pmWkWSBCL51Bfkhn79xPuKBKHz//H6B+mY6G9/eieuM';
                var expectedData = {};
                expectedData[protectedPageId] = hahsedPassword;

                var viewerFrame = document.getElementById('preview');
                var viewerWindow = viewerFrame.contentWindow;
                expect(viewerWindow.rendererModel.pageToHashedPassword).toEqual(expectedData);
            });
            */
        });

        describe('pages menu permissions tab', function () {
            var closePagesMenu = function () {
                $('.pages-panel-frame button.close').click();
            };

            var openTabPermissions = function(pageTitle) {
                return new Promise(function (resolve, reject) {
                    var subMenuPermissionsIndex = 4;
                    var $pagesMenu = $('.top-bar-page-navigation-select');
                    var currentPageItemSelector = '.pages-tree.tree-root li.pages-tree-node .pages-tree-item:contains("' + pageTitle + '")';

                    $pagesMenu.click();

                    driver.waitForDomElement(currentPageItemSelector, 20, 100)
                        .then(function (data) {
                            data.dom.click();
                            $('.pages-tree.tree-root li .symbol-more').click();
                            $('.dropdown-options.context-menu ol li:nth-child(' + subMenuPermissionsIndex + ')').click();
                            resolve();
                        })
                        .catch(reject);
                });
            };

            var getSelectedProtectionType = function(pageTitle) {
                return new Promise(function (resolve, reject) {
                    openTabPermissions(pageTitle)
                        .then(function () {
                            resolve($('.privacy.tab-inner ul.tab-header li.selected h4').text());
                        })
                        .catch(reject);
                });
            };

            afterEach(function () {
                closePagesMenu();
            });

            it('should get "No restrictions" as page protection type', function (done) {
                getSelectedProtectionType('No restrictions').then(function (type) {
                    expect(type).toBe('No restrictions');
                    done();
                });
            });

            it('should get "Password protection" as page protection type', function (done) {
                getSelectedProtectionType('Password protection').then(function (type) {
                    expect(type).toBe('Password protection');
                    done();
                });
            });

            it('should get "Members only" as page protection type', function (done) {
                getSelectedProtectionType('Members only').then(function (type) {
                    expect(type).toBe('Members only');
                    done();
                });
            });
        });
    });
});