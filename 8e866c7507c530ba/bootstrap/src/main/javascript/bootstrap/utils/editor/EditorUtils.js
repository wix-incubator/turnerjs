/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/22/12
 * Time: 12:29 PM
 */


define.utils('editorUtils:this', function () {

    return ({

        /**
         * this function generates an object which can be used for a WAddPageDialog template page, by
         * taking a page of a saved site, and various arguments which are mainly used for the dialog itself.

         */
        getAddPageTemplateFromMainPage: function (group, serialNumber, applicationType) {
            return this.getAddPageTemplateFromPage('mainPage', group, serialNumber, applicationType);
        },

        getAddPageTemplateFromCurrentPage: function (group, serialNumber, applicationType) {
            return this.getAddPageTemplateFromPage(W.Preview.getPreviewManagers().Viewer.getCurrentPageId(), group, serialNumber, applicationType);
        },

        getAddPageTemplateFromPage: function (pageId, group, serialNumber, applicationType) {

            serialNumber = serialNumber || "";
            var pageLogic = W.Preview.getHtmlElement(pageId).getLogic();

            var groupKey = 'ADD_PAGE_' + group.toUpperCase() + '_GROUPNAME';
//            var groupText = "W.Resources.get('EDITOR_LANGUAGE', \'"+groupKey+"\')";

            var nameKey = 'ADD_PAGE_' + group.toUpperCase() + serialNumber + '_NAME';
//            var nameText = "W.Resources.get('EDITOR_LANGUAGE', \'"+nameKey+"\')";

            var descriptionKey = 'ADD_PAGE_' + group.toUpperCase() + serialNumber + '_DESCRIPTION';
//            var descriptionText = "W.Resources.get('EDITOR_LANGUAGE', \'"+descriptionKey+"\')";

            var serializedPageData = W.ClipBoard.copyComponent(pageLogic);
            serializedPageData = this._handleWixAppsComponents(serializedPageData);

            var ret = {
                'group': groupKey,
                'name': nameKey,
                'applicationType': applicationType || Constants.WEditManager.SITE_TYPE_WEB,
                'previewPic': group.toLowerCase() + serialNumber + ".png",
                'pageDescription': descriptionKey,
                'serializedPageData': serializedPageData
            };
            var strRet = JSON.encode(ret);
            strRet = strRet.replace(/\\\"/g, "\\\'");

//            strRet = strRet.replace(/\"W\.Resources\.get\(\'EDITOR_LANGUAGE\'\, \'ADD_PAGE/g, "W.Resources.get(\'EDITOR_LANGUAGE\', \'ADD_PAGE");
//            strRet = strRet.replace(/\"\,\"applicationType\"/g, ",'applicationType'");
//            strRet = strRet.replace(/\"\,\"serializedPageData\"/g, ",'serializedPageData'");
//            strRet = strRet.replace(/\"\,\"name\"\:/g, ",'name':");

            return strRet;
        },

        _handleWixAppsComponents: function (serializedPageData) {
            var appDataHandler = W.Preview.getPreviewManagers().Viewer.getAppDataHandler();

            if (serializedPageData.components) {
                serializedPageData.components.each(function (component) {
                    if (component.componentType == "wixapps.integration.components.AppPart") {
                        var componentData = component.data;
                        // change app inner ID
                        var appInnerID = componentData.appInnerID;
                        var appData = appDataHandler.getAppData(appInnerID);
                        componentData.appInnerID = appData.appDefinitionId;

                        // change componentId (for e-commerce)
                        var appLogicParams = componentData.appLogicParams;
                        if (appLogicParams && appLogicParams.hasOwnProperty("categoryId")) {
                            appLogicParams["categoryId"].value = "defaultCategory";
                        }
                    }
                    else if (component.hasOwnProperty("components")) {
                        this._handleWixAppsComponents(component);
                    }
                }.bind(this));
            }

            return serializedPageData;
        },

        openSidePanel: function(panelClassName, commandName) {
            var panel = window.$$('[comp=\"' + panelClassName + '\"]')[0];
            var isPanelAlreadyOpen = panel && panel.getLogic().getIsDisplayed();
            if (isPanelAlreadyOpen) {
                return false;
            }
            this._handleOpenSidePanelOnEditorUIRefactor() ;
            W.Commands.executeCommand(commandName);
            return true;
        },

        _handleOpenSidePanelOnEditorUIRefactor: function() {
            var editorPresenter = W.Editor.getEditorUI();
            editorPresenter.updateBreadcrumbState() ;
        },

        getBgData: function(uiSource, index) {
            var managers = W.Preview.getPreviewManagers();
            var env = managers.Config.env.getCurrentFrameDevice().toLowerCase();
            var bgRef = managers.Viewer.getPageData(managers.Viewer.getCurrentPageId()).getData().pageBackgrounds[env].ref;
            var bgData = managers.Data.getDataByQuery(bgRef).getData();
            var pageId = managers.Viewer.getCurrentPageId();
            return {
                c1: Constants.EditorUI.DESIGN_PANEL, // panel
                c2: uiSource, // parent
                c3: managers.Config.env.$viewingDevice, // device
                c4: bgData.url, // bg_image
                c5: this._getBgColor(bgData.color).replace('#',''), // bg_color
                c6: this._getBgScale(bgData), // bg_fit
                c7: bgData.positionx + ' ' + bgData.positiony, // bg_position
                c8: bgData.attachment, // bg_scroll_with_site
                c9: pageId,
                i1: _.isNumber(index) ? index : null // preset_index
            };
        },

        _getBgColor: function(color) {
            var isHex = color.indexOf('#') === 0;
            var isRef = color.indexOf('{') > - 1 && color.indexOf('}') > -1;
            if (isHex) {
                return color;
            }
            else if (isRef) {
                color = color.replace('{','').replace('}','');
                return W.Preview.getPreviewManagers().Theme.getProperty(color).getHex();
            }
            return null;
        },

        _getBgRepeat: function(repeatx, repeaty) {
            repeatx = repeatx.replace('_','-');
            repeaty = repeaty.replace('_','-');
            var repeat = [repeatx, repeaty];
            return repeat.join(' ');
        },

        _getBgScale: function(bgData) {
            var options = {
                fullScreen: {
                    name: 'full_screen',
                    repeatx: 'no-repeat',
                    repeaty: 'no-repeat',
                    width: 'cover'
                },
                fit: {
                    name: 'fit',
                    repeatx: 'no-repeat',
                    repeaty: 'no-repeat',
                    width: 'contain'
                },
                tile: {
                    name: 'tile',
                    repeatx: 'repeat',
                    repeaty: 'repeat',
                    width: 'auto'
                },
                tileVert: {
                    name: 'tile_vert',
                    repeatx: 'no-repeat',
                    repeaty: 'repeat',
                    width: 'auto'
                },
                tileHorz: {
                    name: 'tile_horz',
                    repeatx: 'repeat',
                    repeaty: 'no-repeat',
                    width: 'auto'
                },
                normal: {
                    name: 'normal',
                    repeatx: 'no-repeat',
                    repeaty: 'no-repeat',
                    width: 'auto'
                }
            };

            var preset = _.filter(options, function(option) {
                var x = option.repeatx === bgData.repeatx.replace('_','-');
                var y = option.repeaty === bgData.repeaty.replace('_','-');
                var width = option.width === bgData.width;
                return x && y && width;
            })[0];

            return preset.name;
        }
    });
});
