integration.requireExperiments(['Dropdownmenu']);
integration.noAutomation();

describe('DropDown Menu Tests', function () {
    var compPreset = {
        'compType': 'wysiwyg.viewer.components.menus.DropDownMenu',
        'layout': {
            'width': 400,
            'height': 100
        },
        'styleId': 1
    };

    xit('should run the spec', function () {
        expect(1).toEqual(2);
    });

    describe('DropDown Menu spec', function () {
        it('Should add Menu with preset and then delete it', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.viewercomponents.ViewerComponent.removeComponent(comp);
                    });
            });
        });

        it('Should change Menu skin', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.Component.setSkinForComponent(comp, 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateIndentedMenuButtonSkin');
                    });
            });
        });

        it('Should resize the Menu', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.Component.resizeComponent(comp, {x: 400, y: 0}, automation.Component.componentEdges.LEFT);
                    });
            });
        });

        xit('Should drag the Menu to the top of the site', function () {
            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        return automation.controllers.Mouse.dragComponent(comp, {y: 400, x: 350});
                    });
            });
        });

        // Assuming a site with more then a single page
        function randomPage(pages, currentPage) {
            var page = currentPage;
            while(page === currentPage) {
                page = pages[Math.floor(Math.random() * pages.length)];
            }
            return page;
        }

        it('Should show Menu on all pages', function () {
            var checkedComp,
                currentPage,
                pages;

            automation.Utils.waitsForPromise(function () {
                return Q.resolve()
                    .then(function () {
                        return automation.viewercomponents.ViewerComponent.addComponent(compPreset);
                    })
                    .then(function (comp) {
                        checkedComp = comp;
                        automation.editorcomponents.FloatingPropertyPanelDriver.openFppSync();
                        automation.editorcomponents.FloatingPropertyPanelDriver.changeComponentScopeSync(W.Editor.EDIT_MODE.MASTER_PAGE);
                        automation.editorcomponents.FloatingPropertyPanelDriver.closeFppSync();
                    })
                    .then(function () {
                        pages = automation.controllers.Pages.getPagesIdsSync();
                        currentPage = automation.controllers.Pages.getCurrentPageIdSync();
                        return automation.controllers.Pages.goToPage(randomPage(pages, currentPage));
                    })
                    .then(function() {
                        expect(checkedComp.$view.isNodeDisplayed()).toBe(true);
                        expect(randomPage(pages, currentPage)).not.toBe(currentPage);
                    });
            });
        });
    });
});
