/**
 * User: lotemh
 * Date: 11/21/13
 * Time: 1:36 PM
 */

integration.requireEditor("50a39d1f-63f5-449e-9c1e-4e9d7fb9b6ce", "2164df98-bc65-4306-a5c0-82487395d5a4",
    "ittests@autoqa.com", "123456");

describe("Tiny Menu Preview mode", function () {
    var tinyMenu, tinyMenuBtn, menuList, menuPages;

    beforeAll(function(){
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function(){
                    return automation.controllers.States.switchToMobileEditor();
                })
                .then(function() {
                    return automation.controllers.States.changeToPreviewSync();
                })
                .then(function() {
                    tinyMenu = W.Preview.getPreviewManagers().Viewer.getCompByID('mobile_TINY_MENU').getLogic();
                    tinyMenuBtn = tinyMenu._skinParts.menuButton;
                    menuList = tinyMenu._skinParts.menuContainer.getChildren('ul')[0];
                    menuPages = menuList.getElementsByTagName('li');
                });
        });
    });

    it("should open and close", function () {
        var menuIsVisible = tinyMenu._isDisplayed;
        expect(menuIsVisible).toBeTruthy();
        tinyMenuBtn.click();

        expect(tinyMenuBtn.hasClass('tiny-menu-open')).toBeTruthy();
        expect(menuList.hasClass('tiny-menu-open')).toBeTruthy();
        tinyMenuBtn.click();

        menuIsVisible = tinyMenu._isDisplayed;
        expect(menuIsVisible).toBeTruthy();
        expect(menuList.hasClass('tiny-menu-open')).toBeFalsy();
    });

    it("should have correct symbols", function(){
        expect(window.getComputedStyle(tinyMenuBtn, ':after').content).toBe("≡");//TODO: check if works with ascii code
        tinyMenuBtn.click();
        expect(window.getComputedStyle(tinyMenuBtn, ':after').content).toBe("✕");//todo: same ^
    });

    it("should have correct number of pages and correct pages names", function(){
        tinyMenuBtn.click();
        var numberOfPages = W.Preview.getPageGroup().getChildren().length;
        var pagesNames;
        W.Preview.getPages(function(data){
            pagesNames = Object.keys(data).map(function(key){return data[key].getData().title;});
        });

        expect(menuPages.length).toBe(numberOfPages);

        for(var i=0; i<menuPages.length; i++){
            var pageButtonText = menuPages[i].getChildren()[0].innerHTML;
            expect(pagesNames).toContain(pageButtonText);
        }
    });

    it("should change page on click", function(){

        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function() {
                    var pagesIds;
                    W.Preview.getPages(function(data){
                        pagesIds = Object.keys(data).map(function(key){return key.replace("#","");});
                    });

                    expect(pagesIds).toBeDefined(); //If this fails, it's because W.Preview.getPages turned async.

                    var pagesPromises = pagesIds.map(function(pageHash){
                        return function() {
                            var expectedPageId = pageHash.replace("#","");
                            tinyMenuBtn.click();
                            var menuButton = menuList.getElement('li a[data-refid=' + pageHash + ']');
                            menuButton.click();
                            return automation.controllers.Pages.waitForPageTransitionEnd()
                                .then(function(currentPageData){
                                    expect(currentPageData.pageId).toBe(expectedPageId);
                                });
                        };
                    });
                    pagesPromises.reverse(); //assumption: there is more than 1 page.
                    return pagesPromises.reduce(Q.when,Q.resolve());
                });
        }, 6000);

    });
});
