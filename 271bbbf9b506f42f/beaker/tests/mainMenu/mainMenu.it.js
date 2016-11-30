define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {
    'use strict';

    describe("Document Services - Main menu", function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing main menu spec');
                done();
            });
        });


        var addedLinks = [];

        beforeEach(function (done) {
            _.forEach(addedLinks, function (itemId) {
                documentServices.mainMenu.removeItem(itemId);
            });
            addedLinks = [];
            documentServices.waitForChangesApplied(done);
        });

        function createExternalLinkData(url, target) {
            url = url || 'http://some.url.com';
            target = target || '_self';

            var linkData = documentServices.data.createItem('ExternalLink');
            _.assign(linkData, {
                url: url,
                target: target
            });

            return linkData;
        }

        function getFirstPageMenuItem() {
            return _.first(getMenu());
        }

        function getMenu() {
            return documentServices.mainMenu.getMenu();
        }

        function getType(id) {
            return documentServices.mainMenu.getItemType(id);
        }

        function isRemovable(id) {
            return documentServices.mainMenu.isItemRemovable(id);
        }

        describe('addLinkItem', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.addLinkItem');
            });

            it('Should add a menu item to the menu as the last item', function (done) {
                var expectedExternalLinkData = createExternalLinkData();
                var itemId = documentServices.mainMenu.addLinkItem(_.cloneDeep(expectedExternalLinkData), 'link item');
                addedLinks.push(itemId);

                documentServices.waitForChangesApplied(function () {
                    var lastMenuItem = _.last(getMenu());
                    expect(lastMenuItem.label).toEqual('link item');
                    expect(lastMenuItem.id).toEqual(itemId);
                    expect(lastMenuItem.link.target).toEqual(expectedExternalLinkData.target);
                    expect(lastMenuItem.link.url).toEqual(expectedExternalLinkData.url);
                    expect(lastMenuItem.link.type).toEqual(expectedExternalLinkData.type);
                    done();
                });
            });

            it('Should add a sub-menu-item to a specific parent as the last item', function (done) {
                var expectedExternalLinkData = createExternalLinkData();

                var itemId = documentServices.mainMenu.addLinkItem(_.cloneDeep(expectedExternalLinkData), 'sub menu link item 1', getFirstPageMenuItem().id);
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {

                    var lastSubItem = _.last(getFirstPageMenuItem().items);
                    expect(lastSubItem.label).toEqual('sub menu link item 1');
                    expect(lastSubItem.id).toEqual(itemId);
                    expect(lastSubItem.link.target).toEqual(expectedExternalLinkData.target);
                    expect(lastSubItem.link.url).toEqual(expectedExternalLinkData.url);
                    expect(lastSubItem.link.type).toEqual(expectedExternalLinkData.type);
                    done();
                });
            });

            it('Should prevent adding a sub-item to a sub-item (enforce up to 2 levels of items)', function (done) {
                var subItemData = createExternalLinkData();
                var subItemId = documentServices.mainMenu.addLinkItem(subItemData, 'sub menu link item 2', getFirstPageMenuItem().id);
                addedLinks.push(subItemId);
                var subSubItemData = createExternalLinkData();

                errorUtils.waitForError(documentServices, done, "Cannot add/move items into a sub item");
                documentServices.mainMenu.addLinkItem(subSubItemData, 'sub  sub menu link item', subItemId);
            });

            it('should throw when adding a PageLink', function (done) {
                var pageLink = _.assign(documentServices.data.createItem('PageLink'), {
                    pageId: 'somePageId'
                });

                errorUtils.waitForError(documentServices, done, 'Explicitly adding a LinkItem of type "PageLink" is not allowed');
                documentServices.mainMenu.addLinkItem(pageLink, 'Page Link');
            });

        });

        describe('addHeaderItem', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.addHeaderItem');
            });

            it('should throw when adding a menu item to a parent ID that doesn\'t exist', function (done) {
                errorUtils.waitForError(documentServices, done, 'Parent "someParentIdLaLaLaLaLa" does not exist');
                documentServices.mainMenu.addHeaderItem('Header label', 'someParentIdLaLaLaLaLa');
            });

            it('should throw when adding a menu item to a parent that\'s not a BasicMenuItem or CustomMenu', function (done) {
                errorUtils.waitForError(documentServices, done, 'Parent of type "Document" is not a legal parent. Please provide parent of types "BasicMenuItem" or "CustomMenu" only');
                documentServices.mainMenu.addHeaderItem('Header label', 'masterPage');
            });

            it('hould add a header item to the main menu as the last item when not provided parent id', function (done) {
                var itemId = documentServices.mainMenu.addHeaderItem('Header label 1');
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    var lastMenuItem = _.last(getMenu());
                    expect(lastMenuItem.label).toEqual('Header label 1');
                    expect(lastMenuItem.id).toEqual(itemId);
                    done();
                });
            });

            it('Should add a header item to the menu as the last item', function (done) {
                var itemId = documentServices.mainMenu.addHeaderItem('Header label 2', getFirstPageMenuItem().id);
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    var lastMenuItem = _.last(getFirstPageMenuItem().items);
                    expect(lastMenuItem.label).toEqual('Header label 2');
                    expect(lastMenuItem.id).toEqual(itemId);
                    done();
                });
            });

        });

        describe('removeItem', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.removeItem');
            });

            it('should remove it from the menu', function (done) {
                var expectedMenu = getMenu();
                var itemId = documentServices.mainMenu.addHeaderItem('some header');
                documentServices.mainMenu.removeItem(itemId);
                documentServices.waitForChangesApplied(function () {
                    var newMenu = getMenu();
                    expect(newMenu).toEqual(expectedMenu);
                    done();
                });
            });

            it('should throw when deleting a PageLink', function (done) {
                errorUtils.waitForError(documentServices, done, "Explicitly deleting a page link item is not allowed");
                documentServices.mainMenu.removeItem(getFirstPageMenuItem().id);
            });

            it('should flatten an item\'s children in place when deleting a parent item', function (done) {
                var headerItemId = documentServices.mainMenu.addHeaderItem('some header');
                var link1Id = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 1', headerItemId);
                var link2Id = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 2', headerItemId);
                addedLinks.push(link1Id);
                addedLinks.push(link2Id);
                documentServices.mainMenu.moveItem(headerItemId, null, 1);
                var expectedMenu;
                documentServices.waitForChangesApplied(function () {
                    expectedMenu = _.cloneDeep(getMenu());
                    expectedMenu.splice.apply(expectedMenu, [1, 1].concat(expectedMenu[1].items));
                }, true);

                documentServices.mainMenu.removeItem(headerItemId);
                documentServices.waitForChangesApplied(function () {
                    var newMenu = getMenu();
                    expect(newMenu).toEqual(expectedMenu);
                    done();
                });
            });
        });

        describe('moveItem', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.moveItem');
            });

            describe("successful", function () {

                beforeEach(function (done) {
                    this.link1 = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 1');
                    addedLinks.push(this.link1);
                    documentServices.waitForChangesApplied(done);
                });

                it('should move an item to its new location', function (done) {
                    var expectedMenu = _.cloneDeep(getMenu());
                    var item = expectedMenu.splice(-1, 1)[0];
                    expectedMenu.splice(1, 0, item);

                    documentServices.mainMenu.moveItem(this.link1, null, 1);
                    documentServices.waitForChangesApplied(function () {
                        var newMenu = getMenu();
                        expect(newMenu).toEqual(expectedMenu);
                        done();
                    });
                });

                it('should move an item to another parent item', function (done) {
                    var headerItemId = documentServices.mainMenu.addHeaderItem('Header');
                    addedLinks.push(headerItemId);
                    var expectedMenu;
                    documentServices.waitForChangesApplied(function () {
                        expectedMenu = _.cloneDeep(getMenu());
                        var item = expectedMenu.splice(-2, 1)[0];
                        _.last(expectedMenu).items.push(item);
                    }, true);

                    documentServices.mainMenu.moveItem(this.link1, headerItemId, 0);
                    documentServices.waitForChangesApplied(function () {
                        var newMenu = getMenu();
                        expect(newMenu).toEqual(expectedMenu);
                        done();
                    });
                });

                it("should move a sub item to be a main item", function (done) {
                    var link2 = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 2');
                    addedLinks.push(link2);

                    documentServices.waitForChangesApplied(function () {
                        var expectedMenu = _.cloneDeep(getMenu());
                        var lastIndex = expectedMenu.length - 1;
                        documentServices.mainMenu.moveItem(link2, this.link1, 0);
                        documentServices.mainMenu.moveItem(link2, null, lastIndex);
                        documentServices.waitForChangesApplied(function () {
                            var newMenu = getMenu();
                            expect(newMenu).toEqual(expectedMenu);
                            done();
                        });
                    }.bind(this));
                });
            });

            it('should prevent moving an item with children to another parnet item', function (done) {
                var headerItem1Id = documentServices.mainMenu.addHeaderItem('Header 1');
                addedLinks.push(headerItem1Id);
                var linkItemId = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 2', headerItem1Id);
                addedLinks.push(linkItemId);
                var headerItem2Id = documentServices.mainMenu.addHeaderItem('Header 2');
                addedLinks.push(headerItem2Id);

                errorUtils.waitForError(documentServices, done, "Cannot move item with sub items (#" + headerItem1Id + ") to anything other than  #CUSTOM_MAIN_MENU");
                documentServices.mainMenu.moveItem(headerItem1Id, headerItem2Id, 0);
            });

            it('should prevent moving a sub-item into a sub-item (enforce up to 2 levels of items)', function (done) {
                var headerItemId = documentServices.mainMenu.addHeaderItem('Header 1');
                addedLinks.push(headerItemId);
                var subItem1Id = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 1', headerItemId);
                var subItem2Id = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 2', headerItemId);
                addedLinks.push(subItem1Id);
                addedLinks.push(subItem2Id);

                errorUtils.waitForError(documentServices, done, "Cannot add/move items into a sub item");
                documentServices.mainMenu.moveItem(subItem2Id, subItem1Id, 1);
            });
        });

        describe('Item types & removability', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.getItemType');
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.isItemRemovable');
            });

            it('Menu header item should be of type HEADER and should be removable', function (done) {
                var headerId = documentServices.mainMenu.addHeaderItem('Header 1');
                addedLinks.push(headerId);
                documentServices.waitForChangesApplied(function () {
                    expect(getType(headerId)).toEqual(documentServices.mainMenu.ITEM_TYPES.HEADER);
                    expect(isRemovable(headerId)).toBe(true);
                    done();
                });
            });

            it('External link menu item should be of type LINK and should be removable', function (done) {
                var itemId = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'Link 1');
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    expect(getType(itemId)).toEqual(documentServices.mainMenu.ITEM_TYPES.LINK);
                    expect(isRemovable(itemId)).toBe(true);
                    done();
                });
            });

            it('Document link menu item should be of type LINK and should be removable', function (done) {
                var documentLinkData = documentServices.data.createItem('DocumentLink');
                var itemId = documentServices.mainMenu.addLinkItem(documentLinkData, 'Link 1');
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    expect(getType(itemId)).toEqual(documentServices.mainMenu.ITEM_TYPES.LINK);
                    expect(isRemovable(itemId)).toBe(true);
                    done();
                });
            });

            it('Email link menu item should be of type LINK and should be removable', function (done) {
                var documentLinkData = documentServices.data.createItem('EmailLink');
                var itemId = documentServices.mainMenu.addLinkItem(documentLinkData, 'Link 1');
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    expect(getType(itemId)).toEqual(documentServices.mainMenu.ITEM_TYPES.LINK);
                    expect(isRemovable(itemId)).toBe(true);
                    done();
                });
            });

            it('Anchor link menu item should be of type LINK and should be removable', function (done) {
                var documentLinkData = documentServices.data.createItem('AnchorLink');
                var itemId = documentServices.mainMenu.addLinkItem(documentLinkData, 'Link 1');
                addedLinks.push(itemId);
                documentServices.waitForChangesApplied(function () {
                    expect(getType(itemId)).toEqual(documentServices.mainMenu.ITEM_TYPES.LINK);
                    expect(isRemovable(itemId)).toBe(true);
                    done();
                });
            });

            it(' Page menu item should be of type page and should be removable', function () {
                var itemId = getFirstPageMenuItem().id;
                expect(getType(itemId)).toEqual(documentServices.mainMenu.ITEM_TYPES.PAGE);
                expect(isRemovable(itemId)).toBe(false);
            });
        });


        describe('Item\'s label', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.mainMenu.setItemLabel');
            });

            it('should change the item\'s label', function (done) {
                var newLabel = 'New Label';
                var menuItemId = documentServices.mainMenu.addLinkItem(createExternalLinkData(), 'some label');

                addedLinks.push(menuItemId);
                documentServices.mainMenu.setItemLabel(menuItemId, newLabel);

                documentServices.waitForChangesApplied(function () {
                    expect(_.last(getMenu()).label).toEqual(newLabel);
                    done();
                });
            });

            it('should success to set the label for a page item', function (done) {
                var newLabel = 'New label';
                documentServices.mainMenu.setItemLabel(getFirstPageMenuItem().id, newLabel);
                documentServices.waitForChangesApplied(function () {
                    expect(getFirstPageMenuItem().label).toEqual(newLabel);
                    done();
                });
            });
        });

        describe('Item Visibility', function () {
            it('should change the item\'s visibility'); // todo

            it('should change the item\'s mobile visibility'); //todo

            it('should change the item\'s mobile visibility according to the general visibility, if the mobile visibility hasn\'t yet been set directly'); //todo

            it('should throw when setting visibility of a page link item'); // todo
        });
    });
});
