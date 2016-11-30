describe("Integration test for the Background Per Page feature.", function() {

    var BG_PRESETS_SELECTOR     = '[comp="wysiwyg.editor.components.inputs.bg.BgPresetSelector"]' ;
    var DESIGN_PANEL_SELECTOR   = '[comp="wysiwyg.editor.components.panels.BackgroundDesignPanel"]' ;
    var siteNode = null ;

    beforeAll(function() {
        siteNode = W.Preview.getPreviewManagers().Viewer.getSiteNode() ;
    }) ;

    it("should be able to set custom BG properties such as position and tiling to a background.", function() {
        var panelComponent      = null ;
        var bgPresetSelector    = null ;
        automation.Utils.waitsForPromise(function () {
            return Q.resolve()
                .then(disableAllCustomPagesBgs)
                .then(gotoMainPage)
                .then(openBackgroundDesignPanel)
                .then(function(panel) {
                    panelComponent = panel;
                    return panelComponent ;
                })
                .then(getRandomBackgroundPreset)
                .then(function(randomBgPresetSelector) {
                    bgPresetSelector = randomBgPresetSelector ;
                    return pickBackgroundFromPreset(panelComponent, bgPresetSelector) ;
                })
                .then(openBackgroundEditingPanel)
                .then(function(backgroundEditorPanel) {
                    var bgCssValuesToApply = "none 100px 100px center bottom auto repeat no-repeat fixed #FF0000" ;
                    setCustomBgValuesInEditorPanel(backgroundEditorPanel, bgCssValuesToApply) ;
                })
                .then(function() {
                    expect(getShowingBackgroundProperty("background-color").toUpperCase()).toBe("#FF0000") ;
                    expect(getShowingBackgroundProperty("background-repeat-x").toUpperCase()).toBe("REPEAT") ;
                    expect(getShowingBackgroundProperty("background-repeat-y").toUpperCase()).toBe("NO-REPEAT") ;

                    var presetBackground    = bgPresetSelector.getDataItem().get("siteBg") ;
                    var presetBackgroundImg = presetBackground.split(" ")[0] ;
                    expect(_.contains(getShowingBackgroundImage(), presetBackgroundImg)).toBeTruthy() ;
                }) ;
        }) ;
    }) ;

    it("Should be able to set a custom background to a page and copy it to other pages.", function() {
        var selectFirstNodeNotMain = function(pagesModel) {
            if(!pagesModel) {
                return null ;
            }
            for(var i=0; i < pagesModel.length; i++) {
                var pageNodeItem = pagesModel[i];
                if(pageNodeItem.pageDataRef !== "#mainPage") {
                    pageNodeItem.isSelected = true ;
                    return pageNodeItem.pageDataRef ;
                } else {
                    var res = selectFirstNodeNotMain(pageNodeItem.children) ;
                    if(res) {
                        return res ;
                    }
                }
            }
            return null ;
        } ;

        var panelComponent                  = null ;
        var mainPageCustomBg                = null ;
        automation.Utils.waitsForPromise(function() {
            return Q.resolve()
                .then(function() {
                    var pagesIds = automation.controllers.Pages.getPagesIdsSync() ;
                    if(!pagesIds || pagesIds.length === 0) {
                        throw new SinglePageSiteError({isSinglePageSite: false}) ;
                    } else if(pagesIds && pagesIds.length === 1) {
                        throw new SinglePageSiteError({isSinglePageSite: true}) ;
                    }
                })
                .then(disableAllCustomPagesBgs)
                .then(gotoMainPage)
                .then(openBackgroundDesignPanel)
                .then(function(backgroundDesignPanel) {
                    panelComponent = backgroundDesignPanel ;
                    return panelComponent ;
                })
                .then(getRandomBackgroundPreset)
                .then(function(bgPresetSelector) {
                    // make the page's Background custom!
                    return pickBackgroundFromPreset(panelComponent, bgPresetSelector) ;
                })
                .then(function() {
                    mainPageCustomBg = W.BackgroundManager.getCurrentlyShowingBackground() ;
                    return panelComponent ;
                })
                .then(getPageCustomizerDialog)
                .then(function(dialogComponent) {
                    var pagesModel = dialogComponent.getPagesSelection() ;
                    // select the first node which isn't mainpage.
                    var selectedPageRef = selectFirstNodeNotMain(pagesModel) ;
                    var params = {result: W.EditorDialogs.DialogButtons.OK} ;
                    dialogComponent._onDialogClosing(params) ;
                    return selectedPageRef ;
                })
                .then(function(selectedPageRef) {
                    expect(selectedPageRef).not.toBeNull() ;
                    expect(selectedPageRef).toBeDefined() ;
                    if(selectedPageRef.charAt(0) === "#") {
                        selectedPageRef = selectedPageRef.substr(1, selectedPageRef.length) ;
                    }
                    return automation.controllers.Pages.goToPage(selectedPageRef) ;
                })
                .then(function() {
                    var showingBg = W.BackgroundManager.getCurrentlyShowingBackground() ;
                    expect(mainPageCustomBg.toString()).toBe(showingBg.toString()) ;
                })
                .catch(function(error) {
                    expect(error).toBeDefined() ;
                    expect(error.args && error.args.isSinglePageSite).toBeTruthy() ;
                }) ;
        }) ;
    }) ;

    /* =========== Helper IT functions =========== */

    var SinglePageSiteError = function SinglePageSiteError(args){
        this.args = args ;
    } ;

    function disableAllCustomPagesBgs() {
        var pagesIds    = automation.controllers.Pages.getPagesIdsSync() ;
        pagesIds.forEach(function(pageId) {
            W.BackgroundManager.disableCustomBG(pageId, "DESKTOP") ;
            W.BackgroundManager.disableCustomBG(pageId, "MOBILE") ;
        }) ;
    }

    function openBackgroundDesignPanel() {
        return Q.resolve().
            then(function() {
                W.Commands.executeCommand("WEditorCommands.ShowBackgroundDesignPanel") ;
                return automation.WebElement.waitForElementToExist(document.body, DESIGN_PANEL_SELECTOR) ;
            })
            .then(function(panelView) {
                var panelLogic = panelView.$logic ;
                return automation.Component.waitForComponentReady(panelLogic) ;
            }) ;
    }

    function openBackgroundEditingPanel() {
        // open the Customize-Background inner panel.
        return Q.resolve().
            then(function() {
                W.Commands.executeCommand('WEditorCommands.ShowBackgroundEditorPanel') ;
                var innerPanelSelector = '[comp="wysiwyg.editor.components.panels.BackgroundEditorPanel"]' ;
                return automation.WebElement.waitForElementToExist(document.body, innerPanelSelector) ;
            })
            .then(function(panelView) {
                return panelView.$logic ;
            }) ;
    }

    function gotoMainPage() {
        return automation.controllers.Pages.goToPage("mainPage") ;
    }

    function getRandomBackgroundPreset(backgroundDesignPanel) {
        var randomBgPresetIndex = -1 ;
        return getBackgroundPresetAtIndex(backgroundDesignPanel, randomBgPresetIndex) ;
    }

    function getBackgroundPresetAtIndex(backgroundDesignPanel, index) {
        return Q.resolve().
            then(function() {
                return automation.WebElement.waitForElementToExist(backgroundDesignPanel.$view, BG_PRESETS_SELECTOR) ;
            })
            .then(function() {
                var bgPresets           = backgroundDesignPanel.$view.getElements(BG_PRESETS_SELECTOR) ;
                if(index < 0) {
                    index = Math.floor(Math.random() * bgPresets.length) ;
                }
                var bgPresetSelector    = bgPresets[index % bgPresets.length].$logic ;
                return automation.Component.waitForComponentReady(bgPresetSelector) ;
            }) ;
    }

    function pickBackgroundFromPreset(panelComponent, bgPresetSelector) {
        var event = {'compLogic': bgPresetSelector};
        // Change the background.
        panelComponent._onBackgroundSelection(event) ;
        return bgPresetSelector ;
    }

    function getShowingBackgroundImage() {
        return getShowingBackgroundProperty("background-image") ;
    }

    function getShowingBackgroundProperty(property) {
        var desktopBg = siteNode.getDocument().getElementById("desktopBgNode") ;
        var showingBg = desktopBg.$logic._showingBgPart ;
        return showingBg.getStyle(property) ;
    }

    function getPageCustomizerDialog(panelComponent) {
        return Q.resolve().
            then(function() {
                panelComponent._openPagesBackgroundCustomizer() ;
                var dialogLayer = $$('[skinpart="dialogLayer"]')[0] ;
                var PAGE_CUSTOMIZER_DIALOG_SELECTOR = '[comp="wysiwyg.editor.components.dialogs.PagesBackgroundCustomizer"]' ;
                return automation.WebElement.waitForElementToExist(dialogLayer, PAGE_CUSTOMIZER_DIALOG_SELECTOR) ;
            })
            .then(function(pageCustomizerDialog) {
                var dialogComponent = pageCustomizerDialog.$logic ;
                return automation.Component.waitForComponentReady(dialogComponent) ;
            })
            .then(function(dialogComponent) {
                var promise = automation.Utils.createQWaiter(function () {
                    return !!dialogComponent.getPagesSelection() ;
                });
                return promise(dialogComponent) ;
            }) ;
    }

    function gotoRandomPageWhichIsNotMain() {
        // move to a different page
        var pagesIds = automation.controllers.Pages.getPagesIdsSync() ;
        _.remove(pagesIds, function(pageId) {return pageId === "mainPage" ;}) ;
        var randomPageId = pagesIds[Math.floor(Math.random() * pagesIds.length)] ;
        if(!randomPageId || !pagesIds || pagesIds.length === 0) {
            throw new SinglePageSiteError({isSinglePageSite: true}) ;
        }
        return automation.controllers.Pages.goToPage(randomPageId) ;
    }

    function setCustomBgValuesInEditorPanel(backgroundEditorPanel, bgCssValue) {
        backgroundEditorPanel._tilingChangeHandler(bgCssValue) ;
        backgroundEditorPanel._alignmentChangeHandler(bgCssValue) ;
        backgroundEditorPanel._colorChangedHandler(bgCssValue) ;
    }
});
