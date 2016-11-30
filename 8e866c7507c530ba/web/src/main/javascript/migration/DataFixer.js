(function () {


    function markDataItemAsDirty(id) {
        var idWithoutHash = id;
        if (id.indexOf('#') === 0) {
            idWithoutHash = id.substr(1);
        }

        if (window.W && window.W.Data) {
            window.W.Data.markDirtyCompIdForLater(idWithoutHash);
        }
    }

    function markPropertiesItemAsDirty(id) {
        var idWithoutHash = id;
        if (id.indexOf('#') === 0) {
            idWithoutHash = id.substr(1);
        }

        if (window.W && window.W.ComponentData) {
            window.W.ComponentData.markDirtyCompIdForLater(idWithoutHash);
        }
    }

    function markAllDataNodesAsDirty(dataMap) {
        if (dataMap instanceof Array) {
            _.forEach(dataMap, function (nodeId) {
                markDataItemAsDirty(nodeId);
            });
        } else {
            _.forOwn(dataMap, function (dataNode, id) {
                markDataItemAsDirty(id);
            });
        }
    }

    /**
     *
     * @param dataMap
     * @param {string[]} types - an array of dataTypes to fix
     * @param {function} mapper - a callback invoked with (val, key, collection)
     * @returns {*} the fixed dataMap - though this is fixed in the original dataMap as well, since all the dataNodes are the same reference
     */
    function fixDataNodesForTypes(dataMap, types, mapper) {
        return _(dataMap)
            .pick(function (dataNode) {
                return _.contains(types, dataNode.type);
            })
            .mapValues(mapper)
            .value();
    }

    function isExperimentOpenInDatafixer(experimentName) {
        return window.W && window.W.isExperimentOpen && window.W.isExperimentOpen(experimentName);
    }

    /**
     * '#CUSTOM_MENU_HEADER' is a dummy link id introduced with CustomSiteMenu experiment.
     * If, for some reason, we close the experiment AFTER a site was saved WITH the experiment,
     * The site might have a link pointing to this id, which is illegal.
     * This plugin fixes the problem.
     *
     * ==================================================
     * ==================================================
     * == REMOVE THIS PLUGIN ONCE EXPERIMENT IS MERGED ==
     * ==================================================
     * ==================================================
     *
     *
     * @param docData
     * @returns {{exec: exec}}
     */
    function customMenuHeaderFixer(docData) {

        return {
            exec: function () {
                if (isExperimentOpenInDatafixer('customsitemenu')) {
                    return;
                }
                _.forEach(docData, function (data) {
                    if (data && data.link && data.link === '#CUSTOM_MENU_HEADER') {
                        data.link = '';
                    }
                });
            }
        };
    }

    var unresizableComponents = {
        'wysiwyg.common.components.anchor.viewer.Anchor': true,
        'wysiwyg.common.components.subscribeform.viewer.SubscribeForm': true,
        'wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget': true,
        'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer': true,
        'wixapps.integration.components.AppPart': true,
        'wixapps.integration.components.AppPart2': true,
        'wixapps.integration.components.common.minipart': true,
        'wysiwyg.common.components.onlineclock.viewer.OnlineClock': true,
        'wysiwyg.common.components.weather.viewer.Weather': true,
        'wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton': true,
        'wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow': true,
        'wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer': true,
        'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton': true,
        'wysiwyg.viewer.components.ContactForm': true,
        'wysiwyg.viewer.components.FacebookShare': true,
        'wysiwyg.viewer.components.FiveGridLine': true,
        'wysiwyg.viewer.components.FlickrBadgeWidget': true,
        'wysiwyg.viewer.components.ItunesButton': true,
        'wysiwyg.viewer.components.LinkBar': true,
        'wysiwyg.viewer.components.PayPalButton': true,
        'wysiwyg.viewer.components.PinterestFollow': true,
        'wysiwyg.viewer.components.VKShareButton': true,
        'wysiwyg.viewer.components.WFacebookComment': true,
        'wysiwyg.viewer.components.WGooglePlusOne': true,
        'wysiwyg.viewer.components.mobile.TinyMenu': true
    };

    var notAnchorableComponents = {
        'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton': true,
        'wysiwyg.viewer.components.tpapps.TPAGluedWidget': true
    };

    function removeAnchorsForNotAnchorableComponents(component) {
        if (notAnchorableComponents[component.componentType]) {
            component.layout.anchors = [];
        }

    }

    function WrongAnchorsFixer(pageJsonData) {
        function fixAnchorAndReturnIsStaying(anchor, parentComponent, siblingsMap) {
            var parentId = parentComponent.id;
            var targetComponent = siblingsMap[anchor.targetComponent];
            if (anchor.type === "BOTTOM_PARENT") {
                targetComponent = anchor.targetComponent === parentId ? parentComponent : null;
            }

            if (!targetComponent) {
                return false;
            }

            if (anchor.type === "BOTTOM_BOTTOM" && unresizableComponents[targetComponent.componentType]) {
                return false;
            }

            var propertyToCheck = (anchor.type === "BOTTOM_PARENT" || anchor.type === "BOTTOM_BOTTOM") ? 'height' : 'y';
            var targetValue = targetComponent.layout && targetComponent.layout[propertyToCheck] || 0;
            anchor.originalValue = Math.min(anchor.originalValue, targetValue);
            return true;
        }

        function fixAnchorsForScope(parentComponent, childrenPropertyName) {
            var children = childrenPropertyName ? parentComponent[childrenPropertyName] : parentComponent.components;
            if (_.isEmpty(children)) {
                return;
            }
            var siblingsMap = _.transform(children, function (result, comp) {
                result[comp.id] = comp;
            }, {}, this);

            _.forEach(children, function (component) {
                var anchors = component.layout && component.layout.anchors || [];
                removeAnchorsForNotAnchorableComponents(component);
                var index = 0;
                while (index < anchors.length) {
                    if (fixAnchorAndReturnIsStaying(anchors[index], parentComponent, siblingsMap)) {
                        index += 1;
                    } else {
                        anchors.splice(index, 1);
                    }
                }

                fixAnchorsForScope(component);
            });
        }

        return {
            exec: function () {
                var structureData = pageJsonData.structure;
                var desktopChildrenPropertyName = 'components';
                if (structureData) {
                    if (structureData.type === "Document") {
                        //TODO: update the server to add id to the document node
                        structureData = _.clone(pageJsonData.structure);
                        structureData.id = "SITE_STRUCTURE";
                        pageJsonData.structure = structureData;
                        desktopChildrenPropertyName = 'children';
                    }
                    fixAnchorsForScope(structureData, desktopChildrenPropertyName);
                    fixAnchorsForScope(structureData, 'mobileComponents');
                }
            }
        };
    }

    function TextSecurityFixer(pageJsonData) {
        return {
            exec: function () {
                var data = pageJsonData.data.document_data;
                if (data && window.W && window.W.Data) {
                    var textTypes = ['RichText', 'Text', 'StyledText', 'MediaRichText'];
                    var fixedData = fixDataNodesForTypes(data, textTypes, window.W.Data.textSecurityFixer.bind(window.W.Data));
                }
            }
        };
    }

    function ITunesLanguageFixer(pageJsonData) {
        return {
            exec: function () {
                _.forOwn(pageJsonData.data.component_properties, function (value) {
                    if (value.type === 'ItunesButtonProperties' && (value.language === 'ko' || value.language === 'userLang')) {
                        value.language = 'en';
                    }
                });
            }
        };
    }

    function VerticalMenuFixer(pageJson) {

        function getCompProps(pageJson, comp){
            return pageJson.data.component_properties[comp.propertyQuery.replace('#','')] || {};
        }

        function isAlreadyFixed(pageJson, comp) {
            var props = getCompProps(pageJson, comp);

            return _.isUndefined(props.originalHeight);
        }

        function isFixNeeded(pageJson, comp) {
            return comp.componentType === 'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu' && _.isString(comp.propertyQuery) && !isAlreadyFixed(pageJson, comp);
        }

        function fixVerticalMenu(pageJson, comp) {
            var props = getCompProps(pageJson, comp);

            if (_.isNumber(props.originalHeight) && props.originalHeight > 0) {
                comp.layout.height = props.originalHeight;
                delete props.originalHeight;
                markPropertiesItemAsDirty(comp.propertyQuery);
            }
        }

        function fixComps(pageJson, comps) {
            _.forEach(comps, function (comp) {

                if (isFixNeeded(pageJson, comp)) {
                    fixVerticalMenu(pageJson, comp);
                } else {
                    if (comp.components) {
                        fixComps(pageJson, comp.components);
                    }
                    if (comp.mobileComponents) {
                        fixComps(pageJson, comp.mobileComponents);
                    }
                }
            });
        }

        return {
            exec: function () {
                var structureData = pageJson.structure;

                if (!structureData) {
                    return;
                }
                if (structureData.components) {
                    fixComps(pageJson, structureData.components);
                }
                if (structureData.mobileComponents) {
                    fixComps(pageJson, structureData.mobileComponents);
                }
                if (structureData.children) {
                    fixComps(pageJson, structureData.children);
                }
            }
        };
    }

    //you can reproduce the issue by adding a component bigger than page clicking it once and saving..
    function ToPageAnchorsFixer(pageJsonData) {
        return {
            exec: function () {
                var structureData = pageJsonData.structure;
                if (structureData && structureData.components && !_.isEmpty(structureData.components)) {
                    var BottomMost = _.max(structureData.components, function (compStructure) {
                        var bottom = -1 * Number.MAX_VALUE;
                        if (compStructure.layout && _.isNumber(compStructure.layout.y) && _.isNumber(compStructure.layout.height)) {
                            bottom = compStructure.layout.y + compStructure.layout.height;
                        }
                        return bottom;
                    });
                    var toParentAnchor;
                    if (BottomMost.layout && BottomMost.layout.anchors) {
                        toParentAnchor = _.find(BottomMost.layout.anchors, {'type': 'BOTTOM_PARENT'});
                    }
                    if (!toParentAnchor) {
                        BottomMost.layout = BottomMost.layout || {};
                        BottomMost.layout.anchors = BottomMost.layout.anchors || [];
                        BottomMost.layout.anchors.push({
                            distance: 0,
                            type: "BOTTOM_PARENT",
                            targetComponent: pageJsonData.structure.id,
                            locked: true,
                            originalValue: pageJsonData.structure.layout.height,
                            topToTop: BottomMost.layout.y
                        });
                    }
                }
                //didn't see this problem in mobile
            }
        };
    }

    function faqFixer(pageData) {
        var faqAppPartName = 'f2c4fc13-e24d-4e99-aadf-4cff71092b88';
        var mobileToggleInitialStatePredicate = {
            "type": "AppPartCustomization",
            "forType": "Category",
            "view": "ToggleMobile",
            "key": "comp.initialState",
            "fieldId": "toggle",
            "format": "Mobile"
        };

        _(pageData)
            .filter({appPartName: faqAppPartName, viewName: 'ExpandQuestions'})
            .each(function (part) {
                _(part.appLogicCustomizations)
                    .filter(mobileToggleInitialStatePredicate)
                    .each(function (customization) {
                        customization.fieldId = 'vars';
                        customization.key = 'initialState';
                    });
            });
    }

    function isMasterPage(pageJson){
        return pageJson && pageJson.structure && pageJson.structure.type === 'Document';
    }

    function pagePasswordReverseMigrator(pageJson/*, pageIdsArray*/){
        var HASHED_FROM_SERVER_STUB = 'HASHED_FROM_SERVER';
        if (isMasterPage(pageJson) && window.W && window.W.Data) {
            var documentDataMap = pageJson.data.document_data;
            var rendererModel = window.rendererModel || {};
            var pageToHashedPasswordMap = {};
            _.forEach(rendererModel.passwordProtectedPages, function(pageId){
                pageToHashedPasswordMap[pageId] = HASHED_FROM_SERVER_STUB;
                var pageDataItem = documentDataMap[pageId];
                if (pageDataItem) {
                    pageDataItem.pageSecurity = pageDataItem.pageSecurity || {};
                    pageDataItem.pageSecurity.requireLogin = false;
                    pageDataItem.pageSecurity.passwordDigest = HASHED_FROM_SERVER_STUB; //stub
                }
            });
            window.W.Data.lastProtectedPagesDataForPasswordMigration = pageToHashedPasswordMap;
        }
        return pageJson;
    }

    function MenuFixer(docData, pageIdsArray) {
        var mainMenu = docData.MAIN_MENU,
            siteStructure = docData.SITE_STRUCTURE;
        var menuIds;

        var _retrieveAllMenuIds = function () {
            var menuIds = [];
            _.forEach(mainMenu.items, function (menuItem) {
                menuIds.push(menuItem.refId);
                if (menuItem.items && menuItem.items.length > 0) {
                    for (var i = 0; i < menuItem.items.length; i++) {
                        menuIds.push(menuItem.items[i].refId);
                    }
                }
            });
            return menuIds;
        };
        var _removeTopLevelMenuItem = function (topLevelIndex) {
            var subMenu = mainMenu.items[topLevelIndex];
            if (subMenu.items && subMenu.items.length > 0) {
                _.forEach(subMenu.items, function (menuItem, subItemIndex) { //push the subitems to the top level array before removal
                    mainMenu.items.push(menuItem);
                    delete subMenu.items[subItemIndex]; //delete makes that array item = undefined, does not actually change the array length
                });
            }
            subMenu.items = []; //I prefer deletion of the items + set to empty array over splice an unknown amount of times
            mainMenu.items.splice(topLevelIndex, 1);
        };
        var _findSubMenuItem = function (id) {
            var result = {};
            _.find(mainMenu.items, function (menuItem, topIndex) { //for each item
                result.topIndex = topIndex;
                return _.find(menuItem.items, function (subItem, subIndex) { //check all of it's subitems
                    if (subItem.refId === id) {
                        result.subIndex = subIndex;
                        return true;
                    }
                });
            });

            return result;
        };
        var _removeMenuItem = function (id) {
            var topLevelIndex = _.findIndex(mainMenu.items, function (menuItem) {
                return menuItem.refId === id;
            });
            if (topLevelIndex >= 0) { //case: id to remove is a top level menu item
                _removeTopLevelMenuItem(topLevelIndex);
            } else { //case: id to remove is a subItem
                var location = _findSubMenuItem(id);
                mainMenu.items[location.topIndex].items.splice(location.subIndex, 1);
            }
            window.W.Data.markDirtyCompIdForLater("MAIN_MENU");
        };
        menuIds = _retrieveAllMenuIds();

        var removeAllBlankMenuItems = function () {
            _.forEach(menuIds, function (id) {
                if (!id) {
                    _removeMenuItem(id); //this will take care of id === '' and id === undefined, which is why we pass the id as a parameter
                    LOG.reportError(wixErrors.MENU_CORRUPTION_BLANK_ID, "DataFixer", "menuFixer_plugin");
                }
            });

            _.pull(menuIds, '', undefined);
        };
        var removeMenuItemsForNonexistingPages = function () {
            _.forEach(menuIds, function (id) {
                if (_.indexOf(pageIdsArray, id.slice(1)) < 0) { //id is in #csdf format
                    _removeMenuItem(id);
                    LOG.reportError(wixErrors.MENU_CORRUPTION_UNKNOWN_PAGE, "DataFixer", "menuFixer_plugin", id);
                } else if (docData[id] === null) {
                    LOG.reportError(wixErrors.MENU_CORRUPTION_NULL_PAGE, "DataFixer");
                }
            });
        };

        function reconstructMainMenu() {
            var csmItems = docData.CUSTOM_MAIN_MENU.items;
            mainMenu.items = convertCsmItemToMenuItems([], csmItems);
            markDataItemAsDirty('MAIN_MENU');
            var menuItemsIds = _retrieveAllMenuIds();
            markAllDataNodesAsDirty(menuItemsIds);

        }

        function convertCsmItemToMenuItems(parent, items) {
            items.forEach(function (item) {
                var itemId = item.replace('#', '');
                var basicMenuItem = docData[itemId];
                var linkedItemId = basicMenuItem.link ? basicMenuItem.link.replace('#', '') : null;
                var linkedItem = linkedItemId ? docData[linkedItemId] : null;
                if (linkedItem && linkedItem.type === 'PageLink' && docData[linkedItem.pageId.replace('#', '')]) {
                    parent.push({
                        refId: linkedItem.pageId,
                        items: convertCsmItemToMenuItems([], basicMenuItem.items),
                        type: "MenuItem"
                    });
                } else {
                    convertCsmItemToMenuItems(parent, basicMenuItem.items);
                }
            });

            return parent;
        }

        function deleteCustomSiteMenu() {
            docData.CUSTOM_MENUS.menus = [];
            delete docData.CUSTOM_MAIN_MENU;
            markDataItemAsDirty('MAIN_MENU');
            var menuItemsIds = _retrieveAllMenuIds();
            markAllDataNodesAsDirty(menuItemsIds);
            markDataItemAsDirty('CUSTOM_MENUS');
            markDataItemAsDirty('CUSTOM_MAIN_MENU');
        }

        var addMissingPageIdsToMenu = function () {
            var isCsmExperimentOpen = isExperimentOpenInDatafixer('customsitemenu');
            var emptyMainMenu = mainMenu.items.length === 0;
            var hasCsmData = !!docData.CUSTOM_MAIN_MENU;
            if (hasCsmData) {

                if (emptyMainMenu) {

                    if (isCsmExperimentOpen) {
                        return;
                    }
                    reconstructMainMenu();
                    deleteCustomSiteMenu();
                    return;
                }
                deleteCustomSiteMenu();
            }

            _.forEach(pageIdsArray, function (id) {
                if (_.indexOf(menuIds, '#' + id) < 0) {
                    //id from pages list is not in the main menu, meaning it doesn't exist
                    menuIds.push('#' + id); //add it to our array
                    var newMenuItem = {items: [], refId: '#' + id};
                    mainMenu.items.push(newMenuItem);
                }
            });
        };
        var validateSiteMainPage = function () {
            if (siteStructure && siteStructure.mainPage && !_.contains(pageIdsArray, siteStructure.mainPage.slice(1))) {
                siteStructure.mainPage = '#' + pageIdsArray[0];
                window.W.Data.markDirtyCompIdForLater("SITE_STRUCTURE");
            }
        };

        var convertBrokenPageLinksToMenuHeaders = function () {
            var isCsmExperimentOpen = isExperimentOpenInDatafixer('customsitemenu');
            var hasCsmData = !!docData.CUSTOM_MAIN_MENU;
            var dataItem;
            var dataItemId;
            if (hasCsmData && isCsmExperimentOpen) {

                for (dataItemId in docData) {
                    dataItem = docData[dataItemId];
                    if (dataItem.type !== 'BasicMenuItem' || dataItem.link === '#CUSTOM_MENU_HEADER') {
                        continue;
                    }

                    var linkedDataItem = docData[dataItem.link.replace('#', '')];
                    if (linkedDataItem && (linkedDataItem.type !== 'PageLink' || docData[linkedDataItem.pageId.replace('#', '')])) {
                        continue;
                    }

                    if (linkedDataItem && linkedDataItem.type === 'PageLink') {
                        var params = {p1: linkedDataItem.pageId};
                        LOG.reportError(wixErrors.MISSING_PAGE_BECAME_CUSTOM_MENU_HEADER, 'DataFixer', 'convertBrokenPageLinksToMenuHeaders', params);
                    }

                    dataItem.link = '#CUSTOM_MENU_HEADER';
                }
            }
        };

        var fixBasicMenuItemsWithNoLink = function () {
            _.forEach(docData, function (dataItem) {
                if (dataItem.type === 'BasicMenuItem' && !dataItem.hasOwnProperty('link')) {
                    dataItem.link = '';
                }
            });
        };

        function removeCustomSiteMenuIfNotLegal() {
            var isCsmExperimentOpen = isExperimentOpenInDatafixer('customsitemenu');
            var hasCsmData = !!docData.CUSTOM_MAIN_MENU;

            if (isCsmExperimentOpen && hasCsmData) {
                var items = docData.CUSTOM_MAIN_MENU.items;
                for (var i = 0; i < items.length; i++) {
                    if (!docData[items[i].replace('#', '')]) {
						LOG.reportError(wixErrors.DELETED_CORRUPTED_CUSTOM_SITE_MENU, 'DataFixer', 'removeCustomSiteMenuIfNotLegal', JSON.stringify(docData.CUSTOM_MAIN_MENU));
                        delete docData.CUSTOM_MAIN_MENU;
                        delete docData.CUSTOM_MENUS;

						markDataItemAsDirty('CUSTOM_MAIN_MENU');
						markDataItemAsDirty('CUSTOM_MENUS');
                        return;
                    }
                }
            }
        }

        return {
            _menuIds: menuIds,
            exec: function () {
                removeAllBlankMenuItems();
                removeMenuItemsForNonexistingPages();
				// WOH-10874 fixes corrupt custom site menu that prevents editor from loading
				if (W && W.Experiments && W.Experiments.isExperimentOpen('RemoveCustomSiteMenuIfNotLegal')) {
                removeCustomSiteMenuIfNotLegal();
				}
                addMissingPageIdsToMenu();
                fixBasicMenuItemsWithNoLink();
                convertBrokenPageLinksToMenuHeaders();
                validateSiteMainPage();
            }
        };
    }

    function fixProductPageCustomizations(data) {

        var permaLinkDataItems = _.filter(data, function (dataItem) {
            return dataItem.type === "PermaLink";
        });

        var productPagePartDataItems = _.map(permaLinkDataItems, function (dataItem) {
            var appPartDataId = dataItem.dataItemRef && dataItem.dataItemRef.replace('#', '');
            return appPartDataId && data[appPartDataId];
        });


        _.forEach(productPagePartDataItems, function (dataItem) {
            if (dataItem.appPartName !== "f72a3898-8520-4b60-8cd6-24e4e20d483d") {
                return;
            }
            var customizations = dataItem && dataItem.appLogicCustomizations;
            _.remove(customizations, function (cust) {
                return (cust.view === "SocialButtons" && cust.format === "Mobile");
            });
        });
    }

    function createDataFixer() {
        function FixData(data) {
            var pageJson = FixPageJson({'data': data});
            return pageJson.data;
        }

        function FixPageJson(pageJson, pageIdsArray) {
            pageJson.data = pageJson.data || {};
            pageJson.data.document_data = pageJson.data.document_data || {};
            pageJson.data.theme_data = pageJson.data.theme_data || {};
            pageJson.data.component_properties = pageJson.data.component_properties || {};
            FixData.plugins.forEach(function (plugin) {
                pageJson = plugin.exec(pageJson, pageIdsArray);
            });
            return pageJson;
        }

        FixData.plugins = [];

        FixData.plugins.push({
            exec: function (pageJson) {
                customMenuHeaderFixer(pageJson.data.document_data).exec();
                return pageJson;
            }
        });

		// CLNT-4002 - fix document media icon not showing due to storage url change
        FixData.plugins.push({
			exec: function (pageJson, pageIdsArray) {
				if (pageJson.structure.type === 'Page') {
					var components = pageJson.structure.components;
					var compProps = pageJson.data.document_data;
					_.forEach(components, function (comp) {
						if (comp.componentType.indexOf('DocumentMedia') > -1) {
							var dataQuery = comp.dataQuery;
							var docCompData = compProps[dataQuery.replace('#', '')];
							if (docCompData.uri.indexOf('media/') === 0) {
								docCompData.uri = docCompData.uri.replace('media/', '');
								markDataItemAsDirty(docCompData.id);
							}
						}
					});
				}
				return pageJson;
			}
		});

		FixData.plugins.push({
            /**
             * When merging Dropdownmenu, remove this plugin
             *
             * @param pageJson
             * @returns {*}
             */
            exec: function (pageJson) {
                var structure = pageJson.structure,
                    mainMenuId = '#MAIN_MENU';

                if (isExperimentOpenInDatafixer('Dropdownmenu') || !structure) {
                    return pageJson;
                }

                function needFix(comp) {
                    return comp.componentType === 'wysiwyg.viewer.components.menus.DropDownMenu' && comp.dataQuery !== mainMenuId;
                }

                function fixDdm(comp) {
                    if (needFix(comp)) {
                        comp.dataQuery = mainMenuId;
                    } else {
                        _.forEach(comp.components, fixDdm);
                    }
                }

                _.forEach(structure.children || structure.components, fixDdm);

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                var data = pageJson.data;
                if (data.document_data.THEME_DATA) {
                    if (!data.theme_data.THEME_DATA) {
                        data.theme_data.THEME_DATA = data.document_data.THEME_DATA;
                        //                    data.document_data.THEME_DATA.type = 'WFlatTheme';
                    }
                    delete data.document_data.THEME_DATA;
                }
                return pageJson;
            }
        });

        /**
         *   MenuFixer plugin:
         * 1. Deletes menu items if there is no id or the id is blank
         * 2. Deletes menu items if there does not exist a page with that id
         * 3. Creates menu items for pages which do not have a menu item
         * 4. Checks the mainPage of the site. If the specified id does not exist in the pagelist, it sets it to a new page.
         *
         * And... reports to BI for all of them
         * **/
        FixData.plugins.push({
            exec: function (pageJson, pageIdsArray) {
                var docData = pageJson.data.document_data;
                var dataItemKey;
                var dataItem;

                if (!pageIdsArray) {
                    pageIdsArray = [];
                    for (dataItemKey in docData) {
                        dataItem = docData[dataItemKey];
                        if (dataItem && (dataItem.type === 'Page' || dataItem.type === 'AppPage')) {
                            pageIdsArray.push(dataItem.id);
                        }
                    }
                }

                if (!docData.MAIN_MENU || !pageIdsArray) {
                    return pageJson;
                }

                if (window.W.Data) {
                    var menuFixer = new MenuFixer(docData, pageIdsArray);
                    menuFixer.exec();
                }

                return pageJson;
            }
        });

        /**
         * checks for components under the pageGroup structure, which should not exist (as it should only be pages, and pages don't appear there)
         */
        FixData.plugins.push({
            exec: function (json) {
                try {
                    if (json.structure && json.structure.type === ("Document")) {
                        var pagesContainerStructure = _.find(json.structure.children, {componentType: "wysiwyg.viewer.components.PagesContainer"});

                        // we should only have one component in the pagesContainer - the pageGroup:
                        if (pagesContainerStructure.components.length > 1) {
                            //error
                            return json;
                        }

                        var pageGroupStructure = pagesContainerStructure.components[0];

                        //we should have no components in the pageGroup structure (since pages don't appear here)
                        //so any components here are invalid
                        if (pageGroupStructure.components.length) {
                            //invalid site
                            var invalidComps = _.map(pageGroupStructure.components, 'id');
                            W.SiteInvalidations = [
                                {type: 'compsUnderPageGroup', invalidData: invalidComps}
                            ];

                            LOG.reportError(wixErrors.CORRUPT_SITE_PAGEGROUP_WAS_SAVED_WITH_NONPAGE_CHILDREN, 'DataFixer', '', JSON.stringify(invalidComps));
                        }
                    }
                } catch (e) {
                }
                return json;

            }
        });
//        FixData.plugins.push({
//            exec:function(pageJson){
//            var data = pageJson.data;
//                /**
//                 * This plugin fixes sites that changed the style of the Pages container. This is common in old templates.
//                 * The fix deletes the pages container skin.
//                 */
//                var emptySkin = 'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen';
//                if (window.viewMode === 'preview' && data.theme_data){
//                    if(data.theme_data.pc1) {
//                       data.theme_data.pc1.skin = emptySkin;
//                    }
//                    if(data.theme_data.pc2) {
//                        data.theme_data.pc2.skin = emptySkin;
//                    }
//                }
//                return pageJson;
//            }
//        });

        FixData.plugins.push({
            exec: function (pageJson) {
                /***************************************************************************************************
                 * This plugin is part of the link refactor (merged experiment: linkrefdata).                             *
                 * It does 3 things:                                                                               *
                 * 1. Convert link data items to new ones (with new schemas)                                       *
                 * 2. Covert FlashComponent & SiteButton to new schemas (with new links like #1)                   *
                 * 3. Fixes Image schema to support the new links and updates schema version (for server support)  *
                 ***************************************************************************************************/


                //Handle cases that the DataFixer is running but the DataManager is not available yet.
                //This DataFixer plugin will be called again when the data DataManager is ready
                //(skipped JSONs will be fixed later)
//                if(!window.W.Data) {
//                    return pageJson;
//                }

                var schemasNames = {
                        toFix: ['FlashComponent', 'SiteButton', 'Image'],
                        newNames: ['LinkableFlashComponent', 'LinkableButton', 'Image'],  //Image keeps the schema name and updates the schema version
                        originalLink: ['TextLink', 'Link']
                    },
                    linkDataAttributes = ['href', 'text', 'target', 'icon', 'linkType'],
                    linkTargets = {
                        oldValues: ['same', 'other'],
                        newValues: ['_self', '_blank']
                    };

                var filterSchemasToFix = function (dataItems) {
                    return _.filter(dataItems, function (dataItem) {
                        //Doesn't have a link attribute (already converted)
                        var condition1 = !dataItem.link;
                        //It's one of the schemas names to fix
                        var condition2 = (_.indexOf(schemasNames.toFix, dataItem.type) !== -1);
                        //It's an Image schema that was NOT converted yet
                        var condition3 = true;
                        var isImage = (dataItem.type === schemasNames.toFix[2]);
                        if (isImage) {
                            condition3 = (dataItem.metaData.schemaVersion != '2.0');
                        }

                        return (condition1 && condition2 && condition3);
                    }, this);
                };

                var filterLinkItemsToFix = function (dataItems) {
                    return _.filter(dataItems, function (dataItem) {
                        return (dataItem.linkType && _.indexOf(schemasNames.originalLink, dataItem.type) !== -1);
                    }, this);
                };

                var filterCorruptLinkItems = function (dataItems) {
                    return _.filter(dataItems, function (dataItem) {
                        return (dataItem.type === 'PageLink' && !dataItem.pageId) ||
                            (dataItem.type === 'AnchorLink' && !dataItem.pageId) ||
                            (dataItem.type === 'AnchorLink' && !dataItem.anchorDataId) ||
                            (dataItem.type === 'DocumentLink' && !dataItem.docId);
                    }, this);
                };

                var createItemFromNewSchema = function (dataItem) {
                    var schemaIndex = _.indexOf(schemasNames.toFix, dataItem.type);
                    var newSchemaName = schemasNames.newNames[schemaIndex];

                    //Prepare the new data item
                    var newDataItem = {
                        type: newSchemaName
                    };

                    //Copy schema specific attributes from original data item (without old link attributes)
                    _.reduce(dataItem, function (res, val, key) {
                        if (!res[key] && _.indexOf(linkDataAttributes, key) === -1) {
                            res[key] = val;
                        }
                        return res;
                    }, newDataItem, this);

                    //Create a new link data item and add reference to it in the new data item
                    var linkItem = createNewLinkItem(dataItem, true);
                    if (linkItem) {
                        newDataItem.link = createLinkRef(linkItem.id);
                        newLinkDataItems[linkItem.id] = linkItem;  //Save it to be added later to DataManager
                    }

                    //If the schema name wasn't changes (Image) - update the schema version
                    if (dataItem.type === newDataItem.type) {
                        newDataItem.metaData.schemaVersion = '2.0';
                    }

                    return newDataItem;
                };

                var createNewLinkItem = function (dataItem, shouldGetUniqueId) {
                    var linkType = dataItem.linkType || '';
                    var lowerCaseLinkType = linkType.toLowerCase();
                    var id = (shouldGetUniqueId) ? createUniqueId() : dataItem.id;

                    switch (lowerCaseLinkType) {
                        case "page":
                            return createPageLink(id, dataItem);
                        case "website":
                            return createExternalLink(id, dataItem);
                        case "email":
                            return createEmailLink(id, dataItem);
                        case "document":
                            return createDocumentLink(id, dataItem);
                        case "login":
                            return createLoginToWixLink(id, dataItem);
                        case "admin_login":
                            return null;  //This link type is deprecated. AdminLoginButton component doesn't use it anymore
                        case "free_link":
                            return null;  //Nothing to do with this link (used by eCom, wixapps handles them)
                        case "":
                            return null;  //Nothing to do (there is no link)
                        default:
                            LOG.reportError(wixErrors.UNHANDLED_LINK_TYPE, "DataFixer.Link_Refactor_Plugin", "createNewLinkItem", JSON.stringify(dataItem));
                            return null;
                    }
                };

                var createExternalLink = function (uniqueLinkId, dataItem) {
                    var linkItem = {};
                    linkItem.id = uniqueLinkId;
                    linkItem.type = "ExternalLink";
                    linkItem.target = getLinkTarget(dataItem.target);
                    var url = dataItem.href;
                    if (!url) {
                        return null;
                    }
                    linkItem.url = url;
                    return linkItem;
                };

                var createPageLink = function (uniqueLinkId, dataItem) {
                    var linkItem = {};
                    linkItem.id = uniqueLinkId;
                    linkItem.type = "PageLink";
                    var url = dataItem.href;
                    if (!url) {
                        return null;
                    }
                    var indexOfPageId = url.lastIndexOf("/");
                    if (indexOfPageId < 0) {
                        indexOfPageId = url.lastIndexOf("|");  //Legacy sites
                    }
                    url = url.substr(indexOfPageId + 1);
                    linkItem.pageId = createLinkRef(url);
                    return linkItem;
                };

                var createDocumentLink = function (uniqueLinkId, dataItem) {
                    var linkItem = {};
                    var docId;
                    var queryParamStartIndex;
                    linkItem.type = "DocumentLink";
                    linkItem.id = uniqueLinkId;
                    var docURL = dataItem.href;
                    if (!docURL) {
                        return null;
                    }
                    docId = docURL.substr(docURL.lastIndexOf("/") + 1);

                    queryParamStartIndex = docId.indexOf('?dn=');
                    if (queryParamStartIndex != -1) {
                        docId = docId.substring(0, queryParamStartIndex);
                    }
                    linkItem.docId = docId;

                    linkItem.name = dataItem.text;
                    return linkItem;
                };

                var createEmailLink = function (uniqueLinkId, dataItem) {
                    var linkItem = {};
                    linkItem.id = uniqueLinkId;
                    linkItem.type = "EmailLink";
                    var url = dataItem.href;
                    if (!url || !url.toLowerCase) {
                        return null;
                    }
                    if (url.toLowerCase().indexOf("mailto:") === 0) {
                        url = url.substr("mailto:".length);
                    }
                    var emailAndParams = url.split("?");
                    linkItem.recipient = emailAndParams[0];
                    if (emailAndParams[1]) {
                        var params = parseUrlParams(emailAndParams[1]);
                        if (params.subject) linkItem.subject = params.subject;
                        if (params.body) linkItem.body = params.body;
                    }

                    return linkItem;
                };

                var createLoginToWixLink = function (uniqueLinkId, dataItem) {
                    var linkItem = {};
                    linkItem.id = uniqueLinkId;
                    linkItem.type = "LoginToWixLink";

                    var loginParams = dataItem.text;
                    if (loginParams && loginParams.indexOf('{') === 0) {
                        loginParams = JSON.parse(loginParams);
                        linkItem.postLoginUrl = loginParams['postLoginUrl'];
                        linkItem.postSignupUrl = loginParams['postSignupUrl'];
                        linkItem.dialog = loginParams['type'];
                    }

                    return linkItem;
                };

                var createLinkRef = function (linkId) {
                    if (!linkId) {
                        return null;
                    }
                    if (linkId && linkId.indexOf("#") === 0) {
                        return linkId;
                    }
                    return "#" + linkId;
                };

                var getLinkTarget = function (oldTarget) {
                    var newTarget;
                    var oldTargetsIndex = _.indexOf(linkTargets.oldValues, oldTarget);

                    if (_.indexOf(linkTargets.newValues, oldTarget) !== -1) {
                        newTarget = oldTarget;
                    }
                    else if (oldTargetsIndex !== -1) {
                        newTarget = linkTargets.newValues[oldTargetsIndex];  //The the corresponding new target value
                    }
                    else {
                        newTarget = linkTargets.newValues[1];  //fallback - _blank target
                    }

                    return newTarget;
                };

                var parseUrlParams = function (paramsStr) {
                    var mailParamsObj = {},
                        keyValueRegEx = /([^&=]+)=([^&]*)/g,
                        tmp;

                    //Extract all key-value pairs (format: key=value) from the mail parameters string
                    while (tmp = keyValueRegEx.exec(paramsStr)) {
                        mailParamsObj[tmp[1]] = tmp[2];
                    }

                    return mailParamsObj;
                };

                var createUniqueId = function () {
                    var existingIds = _.keys(pageJson.data.document_data);
                    var id;

                    do {
                        id = (new Date()).getTime().toString(36) + "_" + Math.round(Math.random() * 99999).toString(36);
                        id = id.replace(/\s/g, "_");
                    } while (existingIds[id]) ;

                    return id;
                };

                var data = pageJson.data;
                var dataItems = data.document_data;
                var newLinkDataItems = {};
                var dataItemsToFix;
                var corruptLinkItems = filterCorruptLinkItems(dataItems);


                _.each(corruptLinkItems, function (dataItem) {
                    if (window.W && window.W.Data) {
                        window.W.Data.markCorruptDataItemRef(dataItem.id, dataItem);
                    }
                    delete dataItems[dataItem.id];
                }, this);

                //Fix (convert) schemas to 'linkable' schemas
                dataItemsToFix = filterSchemasToFix(dataItems);
                _.each(dataItemsToFix, function (dataItem) {
                    var newDataItem = createItemFromNewSchema(dataItem);
                    if (newDataItem) {
                        dataItems[dataItem.id] = newDataItem;  //Override the existing data item with the new one (same ID)
                        markDataItemAsDirty(dataItem.id);
                    }
                }, this);

                //Fix (convert) links data items (create new link data items with same id and replace the original)
                dataItemsToFix = filterLinkItemsToFix(dataItems);
                _.each(dataItemsToFix, function (dataItem) {
                    var newLinkDataItem = createNewLinkItem(dataItem);
                    if (newLinkDataItem) {
                        dataItems[dataItem.id] = newLinkDataItem;
                        if (isExperimentOpenInDatafixer("LinkFixerOverride") && window.W.Data) {
                            window.W.Data.shouldSaveOverride = true;
                        }
                        //Don't mark the converted links as dirty because they are not referenced and will be deleted
                        //by the server GC in the next save.
                    }
                }, this);

                //Save all the new links data items. LocalDataResolver will take them from here and add them to Data Manager
                data.links_data = data.links_data || {};
                _.assign(data.links_data, newLinkDataItems);
                return pageJson;
            }
        });

        /**
         * Plugin to fix galleries zoomMode
         */
        FixData.plugins.push({
            exec: function (pageJson) {
                if (isExperimentOpenInDatafixer("linkfixeroverride")) {
                    var fixGalleryFn = function (gallery, key) {
                        if (gallery.galleryImageOnClickAction === "unset") {
                            if (gallery.expandEnabled === false) {
                                gallery.galleryImageOnClickAction = "disabled";
                            } else {
                                gallery.galleryImageOnClickAction = "zoomMode";
                            }
                            markDataItemAsDirty(key);
                        }
                        return gallery;
                    };
                    var galleryPropertyTypes = ["GalleryExpandProperties", "MatrixGalleryProperties", "PaginatedGridGalleryProperties", "SliderGalleryProperties", "SlideShowGalleryProperties"];
                    fixDataNodesForTypes(pageJson.data.component_properties, galleryPropertyTypes, fixGalleryFn);
                }
                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                var structure = pageJson.structure;
                if (!structure) {
                    return pageJson;
                }
                var skinlessComponents = [];
                var skinsData = W.Data.getDataByQuery('#SKINS');
                if (!skinsData) {
                    return pageJson;
                }
                var compToSkinsMap = skinsData.get('components');

                collectSkinlessComponents(structure, skinlessComponents);
                _.forEach(skinlessComponents, function (comp) {
                    var skinList = compToSkinsMap[comp.componentType];
                    // In the new editor, comps can have only style without a skin. As we are not going to add new components to this editor,
                    // I removed the error report of no skin. Fixer still works if something is wrong.
                    if (skinList) {
                        comp.skin = skinList[0];
                    }
                });
                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                if (!isExperimentOpenInDatafixer("BugFixesForReactPublic") && !isExperimentOpenInDatafixer("BugFixesForReactEditor")) {
                    return pageJson;
                }
                var toPageAnchorsFixer = new ToPageAnchorsFixer(pageJson);
                toPageAnchorsFixer.exec();

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                if (!isExperimentOpenInDatafixer("BugFixesForReactPublic") && !isExperimentOpenInDatafixer("BugFixesForReactEditor")) {
                    return pageJson;
                }
                var wrongAnchorsFixer = new WrongAnchorsFixer(pageJson);
                wrongAnchorsFixer.exec();

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                if (!isExperimentOpenInDatafixer("filterText")) {
                    return pageJson;
                }
                var textSecurityFixer = new TextSecurityFixer(pageJson);
                textSecurityFixer.exec();

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                var iTunesLanguageFixer = new ITunesLanguageFixer(pageJson);
                iTunesLanguageFixer.exec();

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                new VerticalMenuFixer(pageJson).exec();
                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                if (isExperimentOpenInDatafixer('EcomSocialIconsMobileDataFix')) {
                    var data = pageJson.data.document_data;
                    if (data) {
                        fixProductPageCustomizations(data);
                    }
                }
                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: function (pageJson) {
                if (isExperimentOpenInDatafixer('FaqInitialStateDataFix')) {
                    var data = pageJson.data.document_data;
                    if (data) {
                        faqFixer(data);
                    }
                }
                return pageJson;
            }
        });

        /**
         * Converts Santa's Group into a regular Container (Editor 1.4 compatibility)
         */
        FixData.plugins.push({
            exec: function (pageJson) {
                var structure = pageJson.structure;
                if (!structure) {
                    return pageJson;
                }

                function convertGroupToContainer(comp) {
                    if (comp.componentType === 'wysiwyg.viewer.components.Group') {
                        comp.componentType = 'core.components.Container';
                        comp.skin = 'wysiwyg.viewer.skins.area.RectangleArea';
                        comp.styleId = 'c1';
                    }
                    _.forEach(comp.components, convertGroupToContainer);
                }

                _.forEach(structure.children || structure.components, convertGroupToContainer);
                _.forEach(structure.mobileComponents, convertGroupToContainer);
                return pageJson;
            }
        });


        /**
         * Add a data item to bgImageStrip if it does not exist (Editor 1.4 compatibility)
         */
        FixData.plugins.push({
            exec: function (pageJson) {
                var structure = pageJson.structure;
                var data = pageJson.data.document_data;
                var fixedDataItemIds = {}
                if (!structure) {
                    return pageJson;
                }

                function fixBgImageStripData(comp) {
                    if (comp.componentType === 'wysiwyg.viewer.components.BgImageStrip' && !comp.dataQuery) {
                        var newId = 'bgImageStrip-' + Number.random(0, 99999).toString(36);
                        newId = newId.replace(" ", "_");
                        comp.dataQuery = '#' + newId;
                        fixedDataItemIds[comp.id] = newId;

                        data[newId] = {
                            alt: "",
                            height: 200,
                            id: newId,
                            metaData: {isHidden: false, isPreset: false, schemaVersion: "2.0"},
                            originalImageDataRef: null,
                            title: "",
                            type: "Image",
                            uri: "//static.parastorage.com/services/skins/2.1144.34/images/wysiwyg/core/themes/editor_web/add_image_thumb.png",
                            width: 200
                        };
                        markDataItemAsDirty(newId);

                    } else {
                        _.forEach(comp.components, fixBgImageStripData);
                    }
                }

                function fixBgImageStripMobileData(comp){
                    if (fixedDataItemIds[comp.id]){
                        comp.dataQuery = '#' + fixedDataItemIds[comp.id];
                    } else {
                        _.forEach(comp.components, fixBgImageStripMobileData);
                    }
                }

                _.forEach(structure.children || structure.components, fixBgImageStripData);
                _.forEach(structure.mobileComponents, fixBgImageStripMobileData);

                return pageJson;
            }
        });

        /**
         * Convert Santa BackgroundMedia to BackgroundImage (Editor 1.4 compatibility)
         */
        FixData.plugins.push({
            exec: function(pageJson){

                if (!pageJson.structure) {
                   return pageJson;
                }

                var data = pageJson.data.document_data;
                var hasBgMedia = _.some(data, {type: 'BackgroundMedia'});

                // If we have no BackgroundMedia items, no need to revert
                if (hasBgMedia) {
                    if (pageJson.structure.type === 'Document') {
                        revertBackgroundMediaOnMaster(data);
                    } else {
                        revertBackgroundMediaOnPages(data, pageJson.structure.id);
                    }
                }

                return pageJson;
            }
        });

        FixData.plugins.push({
            exec: pagePasswordReverseMigrator
        });
        /**
         * Enum string values of image fitting types
         */
        var fittingTypes = {
            SCALE_TO_FILL: 'fill',
            SCALE_TO_FIT: 'fit',
            STRETCH: 'stretch',
            ORIGINAL_SIZE: 'actual_size',
            TILE: 'tile',
            TILE_HORIZONTAL: 'tile_horizontal',
            TILE_VERTICAL: 'tile_vertical',
            FIT_AND_TILE: 'fit_and_tile',
            LEGACY_BG_FIT_AND_TILE: 'legacy_tile',
            LEGACY_BG_FIT_AND_TILE_HORIZONTAL: 'legacy_tile_horizontal',
            LEGACY_BG_FIT_AND_TILE_VERTICAL: 'legacy_tile_vertical',
            LEGACY_BG_NORMAL: 'legacy_normal'
            //CROP: 'crop'
            //CROP_RESIZE: 'cropResize'
        };

        /**
         * Enum string values of image align types
         */
        var alignTypes = {
            CENTER: 'center',
            RIGHT: 'right',
            LEFT: 'left',
            TOP: 'top',
            BOTTOM: 'bottom',
            TOP_RIGHT: 'top_right',
            TOP_LEFT: 'top_left',
            BOTTOM_RIGHT: 'bottom_right',
            BOTTOM_LEFT: 'bottom_left'
        };

        var fittingToRepeatMap = (function(){
            var map = {};
            map[fittingTypes.TILE_HORIZONTAL] = ['repeat', 'no_repeat'];
            map[fittingTypes.LEGACY_BG_FIT_AND_TILE_HORIZONTAL] = ['repeat', 'no_repeat'];
            map[fittingTypes.TILE_VERTICAL] = ['no_repeat', 'repeat'];
            map[fittingTypes.LEGACY_BG_FIT_AND_TILE_VERTICAL] = ['no_repeat', 'repeat'];
            map[fittingTypes.TILE] = ['repeat', 'repeat'];
            map[fittingTypes.LEGACY_BG_FIT_AND_TILE] = ['repeat', 'repeat'];

            // Default
            map[''] = ['no_repeat', 'no_repeat'];
            return map;
        }());

        var fittingToBgMap = (function(){
            var map = {};
            map[fittingTypes.ORIGINAL_SIZE] = 'auto';
            map[fittingTypes.SCALE_TO_FILL] = 'cover';
            map[fittingTypes.SCALE_TO_FIT] = 'contain';

            // Default
            map[''] = 'auto';
            return map;
        }());

        var alignToPositionMap = (function(){
            var map = {};
            map[alignTypes.TOP] = ['center', 'top'];
            map[alignTypes.CENTER] = ['center', 'center'];
            map[alignTypes.BOTTOM] = ['center', 'bottom'];

            map[alignTypes.TOP_LEFT] = ['left', 'top'];
            map[alignTypes.LEFT] = ['left', 'center'];
            map[alignTypes.BOTTOM_LEFT] = ['left', 'bottom'];

            map[alignTypes.TOP_RIGHT] = ['right', 'top'];
            map[alignTypes.RIGHT] = ['right', 'center'];
            map[alignTypes.BOTTOM_RIGHT] = ['right', 'bottom'];

            // Default
            map[''] = ['center', 'center'];
            return map;
        }());

        function revertBackgroundMediaOnMaster(data){
            var backgroundImageDataItems = _.filter(data, {type: 'BackgroundMedia'});
            _.forEach(backgroundImageDataItems, function(item){
                convertBgMediaToBgImage(data, item);
            });
        }

        function revertBackgroundMediaOnPages(data, pageId){
            var desktopRef = data[pageId].pageBackgrounds.desktop.ref.replace('#', '');
            var mobileRef = data[pageId].pageBackgrounds.mobile.ref.replace('#', '');

            var backgroundImageDataItems = [data[desktopRef], data[mobileRef]];
            _.forEach(backgroundImageDataItems, function(item){
                convertBgMediaToBgImage(data, item);
            });
        }

        function convertBgMediaToBgImage(data, item){
            var media, posterRef, mediaRef;
            if (item.mediaRef){
                mediaRef = item.mediaRef.replace('#', '');
                media = data[mediaRef] || {};
                if (media.type === 'WixVideo'){
                    posterRef = media.posterImageRef.replace('#', '');
                    media = data[posterRef] || {};
                    data[mediaRef] = _.defaults({id: mediaRef}, data[posterRef]);
                }
            }

            var position = alignToPositionMap[item.alignType] || alignToPositionMap[''];
            var repeat = fittingToRepeatMap[item.fittingType] || fittingToRepeatMap[''];
            var width = fittingToBgMap[item.fittingType] || fittingToBgMap[''];

            data[item.id] = {
                id: item.id,
                type: 'BackgroundImage',
                'url': media ? media.uri : 'none',
                'imagesizew': media ? media.width : 0,
                'imagesizeh': media ? media.height : 0,
                'positionx': position[0], // left, right, center
                'positiony': position[1], //'top', 'bottom', 'center'
                'width': width,
                'repeatx': repeat[0], //'no_repeat', 'repeat'
                'repeaty': repeat[1], //'no_repeat', 'repeat'
                'attachment': item.scrollType, //'scroll', 'fixed', 'inherit', 'local'
                'color': item.color
            }

            if (item.metaData){
                data[item.id].metaData = item.metaData;
                data[item.id].metaData.schemaVersion = "1.1";
            }

        }
        // End of Convert Santa BackgroundMedia to BackgroundImage


        collectSkinlessComponents = function (comp, collectedComponents) {
            //not a component or master
            if (!comp.componentType && !comp.children) {
                return;
            }
            if (comp.componentType && (!comp.skin || comp.skin === "mobile.core.skins.InlineSkin")) {
                collectedComponents.push(comp);
            }
            var children = comp.children || [];
            var components = comp.components || [];
            var mobileComponents = comp.mobileComponents || [];
            var childComps = _.union(children, components, mobileComponents);
            _.forEach(childComps, function (childComp) {
                collectSkinlessComponents(childComp, collectedComponents);
            });
        };

        function DeadCompSkinBugFixer() {
            this._styleIdGenerator = new DeadCompSkinBugFixer.FakeStyleIdGenerator('deadc-');
            this._compTypeToSkinMap = this._getCompTypeToSkinMap();
        }

        DeadCompSkinBugFixer.FakeStyleIdGenerator = function FakeStyleIdGenerator(prefix) {
            this._prefix = '' + prefix;
            this._counter = 0;
            this._skinToStyle = {};
        };

        DeadCompSkinBugFixer.FakeStyleIdGenerator.prototype = {
            generateStyleId: function (skinId) {
                var result = this._skinToStyle[skinId] = this._skinToStyle[skinId] || this._prefix + this._counter++;
                return result;
            }
        };

        DeadCompSkinBugFixer.shouldSkip = function () {
            var START_DATE = new Date(2014, 4, 29);  // May 29st  2014 - Month is zero-based
            var END_DATE = new Date(2014, 6, 17);   // Jul 17th 2014 - Month is zero-based

            var saveDate = getSaveDateIfInEditor();
            if (saveDate) {
                return saveDate < START_DATE || saveDate > END_DATE;
            }

            var publishDate = getApproximatePublishDateIfInPublicSite();
            if (publishDate) {
                return publishDate < START_DATE;
            }

            return false;
        };

        DeadCompSkinBugFixer.prototype = {
            _getCompTypeToSkinMap: function () {
                var map = {
                    'tpa.viewer.components.TPA3DCarousel': ['tpa.viewer.skins.TPA3DCarouselSkin'],
                    'tpa.viewer.components.TPA3DGallery': ['tpa.viewer.skins.TPA3DGallerySkin'],
                    'tpa.viewer.components.Thumbnails': ['tpa.viewer.skins.TPAThumbnailsSkin'],
                    'tpa.viewer.components.Masonry': ['tpa.viewer.skins.TPAMasonrySkin'],
                    'tpa.viewer.components.Freestyle': ['tpa.viewer.skins.TPAFreestyleSkin'],
                    'tpa.viewer.components.StripSlideshow': ['tpa.viewer.skins.TPAStripSlideshowSkin'],
                    'tpa.viewer.components.StripShowcase': ['tpa.viewer.skins.TPAStripShowcaseSkin'],
                    'tpa.viewer.components.Accordion': ['tpa.viewer.skins.TPAAccordionSkin'],
                    'tpa.viewer.components.Collage': ['tpa.viewer.skins.TPACollageSkin'],
                    'tpa.viewer.components.Honeycomb': ['tpa.viewer.skins.TPAHoneycombSkin'],
                    'tpa.viewer.components.Impress': ['tpa.viewer.skins.TPAImpressSkin'],
                    'tpa.viewer.components.TPASection': ['tpa.viewer.skins.TPASectionSkin'],
                    'tpa.viewer.components.TPAWidget': ['tpa.viewer.skins.TPAWidgetSkin'],
                    'wysiwyg.viewer.components.SiteButton': ['wysiwyg.viewer.skins.button.BasicButton']
                };

                map['wysiwyg.viewer.components.tpapps.TPAWidget'] = map['tpa.viewer.components.TPAWidget'];
                map['wysiwyg.viewer.components.tpapps.TPASection'] = map['tpa.viewer.components.TPASection'];
                map['wysiwyg.viewer.components.tpapps.TPAPlaceholder'] = map['tpa.viewer.components.TPAPlaceholder'];
                map['wysiwyg.viewer.components.tpapps.TPA3DGallery'] = map['tpa.viewer.components.TPA3DGallery'];
                map['wysiwyg.viewer.components.tpapps.TPA3DCarousel'] = map['tpa.viewer.components.TPA3DCarousel'];
                map['wysiwyg.viewer.components.tpapps.TPAGluedWidget'] = map['tpa.viewer.components.TPAGluedWidget'];

                return map;
            },

            _processComponent: function (comp) {
                var replacementSkinArray, replacementSkin;
                if ('skins.viewer.deadcomp.DeadCompPreviewSkin' === comp.skin &&
                    (replacementSkinArray = this._compTypeToSkinMap[comp.componentType]) &&
                    (replacementSkin = replacementSkinArray[0])) {

                    comp.skin = replacementSkin;
                    comp.styleId = this._styleIdGenerator.generateStyleId(replacementSkin);
                }
            },

            exec: function (pageJson) {
                var structure = pageJson.structure;
                if (!structure) {
                    return pageJson;
                }

                walkComponents(structure, this._processComponent.bind(this));

                return pageJson;
            }
        };

        if (isExperimentOpenInDatafixer('WorkaroundSavedDeadCompSkin') && !DeadCompSkinBugFixer.shouldSkip()) {
            FixData.plugins.push(new DeadCompSkinBugFixer());
        }

        function getEditorModel() {
            if (window.editorModel) {
                return window.editorModel;
            }

            try {
                return window.parent.editorModel;
            } catch (e) {
                return null;
            }
        }

        // copied from lodash 'cause lodash is not available here (TODO: fix that)
        function isDate(value) {
            return value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Date]' || false;
        }

        function getSaveDateIfInEditor() {
            var editorModel = getEditorModel();
            if (!editorModel || !editorModel.siteHeader || !editorModel.siteHeader.version) {
                return null;
            }

            var d = new Date(editorModel.siteHeader.version);
            return isDate(d) && !isNaN(d.getTime()) && d;
        }

        function getApproximatePublishDateIfInPublicSite() {
            var publicModel = window.publicModel;
            if (!publicModel || !publicModel.timeSincePublish) {
                return null;
            }

            var d = new Date(new Date() - publicModel.timeSincePublish);
            return isDate(d) && !isNaN(d.getTime()) && d;
        }

        // this function will recursively walk through all the components, starting from the given one, calling
        // the callback once per component with the component as its only parameter.
        function walkComponents(comp, callback) {
            //not a component or master
            if (!comp.componentType && !comp.children) {
                return;
            }
            if (comp.componentType) {
                callback(comp);
            }
            var children = comp.children || [];
            var components = comp.components || [];
            var mobileComponents = comp.mobileComponents || [];
            var childComps = _.union(children, components, mobileComponents);
            _.forEach(childComps, function (childComp) {
                walkComponents(childComp, callback);
            });
        }

        return {fix: FixData, FixPageJson: FixPageJson};
    }

    define.resource('dataFixer', createDataFixer());
})();
