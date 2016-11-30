define(['lodash', 'testUtils', 'core', 'utils',
    'documentServices/privateServices/FullJsonUpdater',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/mockPrivateServices/MockPrivateServices',
    'documentServices/privateServices/fullFunctionalityConfig',
    'documentServices/component/componentModes',
    'experiment'], function
    (_, /** testUtils */testUtils, core, utils, FullJsonUpdater, componentsDefinitionsMap, DAL, MockPrivateServices,
     fullFunctionalityConfig,
     componentModes, experiment) {
    'use strict';

    var defaultSiteModel = {
        deletedPagesMap: {},
        "publicModel": {
            "externalBaseUrl": "http://sh0801.wix.com/mocksite",
            "domain": "wix.com",
            "premiumFeatures": [],
            "language": "en",
            "favicon": "",
            "suppressTrackingCookies": false,
            "pageList": {
                "masterPage": ["http://static.parastorage.com/sites/475569_f1afcd7ae67f7af345b028826f6a66fd_1.json.z?v=2", "http://static.wixstatic.com/sites/475569_f1afcd7ae67f7af345b028826f6a66fd_1.json.z?v=2", "http://fallback.wix.com/wix-html-editor-pages-webapp/page/475569_f1afcd7ae67f7af345b028826f6a66fd_1.json"],
                "pages": [
                    {
                        "pageId": "cjg9",
                        "title": "Page 2",
                        "urls": ["http://static.parastorage.com/sites/475569_1a69b343cd91cefc243201fbe3f4095b_1.json.z?v=2", "http://static.wixstatic.com/sites/475569_1a69b343cd91cefc243201fbe3f4095b_1.json.z?v=2", "http://fallback.wix.com/wix-html-editor-pages-webapp/page/475569_1a69b343cd91cefc243201fbe3f4095b_1.json"]
                    },
                    {
                        "pageId": "mainPage",
                        "title": "Home",
                        "urls": ["http://static.parastorage.com/sites/475569_35ac46fd2310efdd12ebf3e135889d0a_1.json.z?v=2", "http://static.wixstatic.com/sites/475569_35ac46fd2310efdd12ebf3e135889d0a_1.json.z?v=2", "http://fallback.wix.com/wix-html-editor-pages-webapp/page/475569_35ac46fd2310efdd12ebf3e135889d0a_1.json"]
                    }
                ],
                "mainPageId": "mainPage"
            },
            "siteRevision": 2,
            "timeSincePublish": 2157,
            "adaptiveMobileOn": true
        },
        "serviceTopology": {
            "serverName": "app12.vae.aws",
            "cacheKillerVersion": "1",
            "scriptsDomainUrl": "http://static.parastorage.com/services/wix-users/2.446.0",
            "biServerUrl": "http://frog.wix.com/",
            "userServerUrl": "http://users.wix.com/",
            "billingServerUrl": "http://premium.wix.com/",
            "mediaRootUrl": "http://static.wixstatic.com/",
            "logServerUrl": "http://frog.wix.com/plebs",
            "monitoringServerUrl": "http://TODO/",
            "usersClientApiUrl": "https://users.wix.com/wix-users",
            "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.111.0",
            "basePublicUrl": "http://www.wix.com/",
            "postLoginUrl": "http://www.wix.com/my-account",
            "postSignUpUrl": "http://www.wix.com/new/account",
            "baseDomain": "wix.com",
            "staticMediaUrl": "http://static.wixstatic.com/media",
            "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
            "emailServer": "http://assets.wix.com/common-services/notification/invoke",
            "blobUrl": "http://static.parastorage.com/wix_blob",
            "htmlEditorUrl": "http://editor.wix.com/html",
            "siteMembersUrl": "https://users.wix.com/wix-sm",
            "scriptsLocationMap": {
                "bootstrap": "http://static.parastorage.com/services/bootstrap/2.1054.12",
                "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                "santa-versions": "http://static.parastorage.com/services/santa-versions/1.27.0",
                "automation": "http://static.parastorage.com/services/automation/1.23.0",
                "ecommerce": "http://static.parastorage.com/services/ecommerce/1.184.10",
                "wixapps": "http://static.parastorage.com/services/wixapps/2.431.0",
                "web": "http://static.parastorage.com/services/web/2.1054.12",
                "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                "tpa": "http://static.parastorage.com/services/tpa/2.904.0",
                "ck-editor": "http://static.parastorage.com/services/ck-editor/1.87.0",
                "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.12.0",
                "langs": "http://static.parastorage.com/services/langs/2.458.0",
                "core": "http://static.parastorage.com/services/core/2.1054.12",
                "skins": "http://static.parastorage.com/services/skins/2.1054.12"
            },
            "developerMode": false,
            "productionMode": true,
            "userFilesUrl": "http://static.parastorage.com/",
            "staticHTMLComponentUrl": "http://sh0801.wix.com.usrfiles.com/",
            "secured": false,
            "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
            "premiumServerUrl": "https://premium.wix.com/",
            "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
            "digitalGoodsServerUrl": "http://dgs.wixapps.net/",
            "staticDocsUrl": "http://media.wix.com/ugd",
            "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.111.0"
        },
        "santaBase": "http://static.parastorage.com/services/santa/1.171.0/",
        "configUrls": {
            "serverName": "app12.vae.aws",
            "cacheKillerVersion": "1",
            "usersScriptsRoot": "http://static.parastorage.com/services/wix-users/2.446.0",
            "biServerUrl": "http://frog.wix.com/",
            "userServerUrl": "http://users.wix.com/",
            "billingServerUrl": "http://premium.wix.com/",
            "mediaRootUrl": "http://static.wixstatic.com/",
            "logServerUrl": "http://frog.wix.com/plebs",
            "monitoringServerUrl": "http://TODO/",
            "usersClientApiUrl": "https://users.wix.com/wix-users",
            "publicStaticBaseUri": "http://static.parastorage.com/services/wix-public/1.111.0",
            "basePublicUrl": "http://www.wix.com/",
            "postLoginUrl": "http://www.wix.com/my-account",
            "postSignUpUrl": "http://www.wix.com/new/account",
            "baseDomain": "wix.com",
            "staticMediaUrl": "http://static.wixstatic.com/media",
            "staticAudioUrl": "http://storage.googleapis.com/static.wixstatic.com/mp3",
            "emailServer": "http://assets.wix.com/common-services/notification/invoke",
            "blobUrl": "http://static.parastorage.com/wix_blob",
            "htmlEditorUrl": "http://editor.wix.com/html",
            "siteMembersUrl": "https://users.wix.com/wix-sm",
            "scriptsLocationMap": {
                "bootstrap": "http://static.parastorage.com/services/bootstrap/2.1054.12",
                "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                "santa-versions": "http://static.parastorage.com/services/santa-versions/1.27.0",
                "automation": "http://static.parastorage.com/services/automation/1.23.0",
                "ecommerce": "http://static.parastorage.com/services/ecommerce/1.184.10",
                "wixapps": "http://static.parastorage.com/services/wixapps/2.431.0",
                "web": "http://static.parastorage.com/services/web/2.1054.12",
                "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                "tpa": "http://static.parastorage.com/services/tpa/2.904.0",
                "ck-editor": "http://static.parastorage.com/services/ck-editor/1.87.0",
                "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.12.0",
                "langs": "http://static.parastorage.com/services/langs/2.458.0",
                "core": "http://static.parastorage.com/services/core/2.1054.12",
                "skins": "http://static.parastorage.com/services/skins/2.1054.12"
            },
            "developerMode": false,
            "productionMode": true,
            "userFilesUrl": "http://static.parastorage.com/",
            "staticHTMLComponentUrl": "http://sh0801.wix.com.usrfiles.com/",
            "secured": false,
            "ecommerceCheckoutUrl": "https://www.safer-checkout.com/",
            "premiumServerUrl": "https://premium.wix.com/",
            "appRepoUrl": "http://assets.wix.com/wix-lists-ds-webapp",
            "digitalGoodsServerUrl": "http://dgs.wixapps.net/",
            "staticDocsUrl": "http://media.wix.com/ugd",
            "publicStaticsUrl": "http://static.parastorage.com/services/wix-public/1.111.0"
        },
        "debugMode": "nodebug",
        "rendererModel": {
            "metaSiteId": "6dda33ff-ca4e-405f-8f71-e54ec22a72eb",
            "siteInfo": {
                "applicationType": "HtmlWeb",
                "documentType": "UGC",
                "siteId": "bac442c8-b7fd-4bd1-ac7e-096fec2fc800",
                "siteTitleSEO": "reactest"
            },
            "clientSpecMap": {
                "1": {
                    "type": "wixapps",
                    "applicationId": 1,
                    "appDefinitionId": "e4c4a4fb-673d-493a-9ef1-661fa3823ad7",
                    "datastoreId": "138d5d48-8fae-d05a-109b-550066a8aaea",
                    "packageName": "menu",
                    "state": "Initialized",
                    "widgets": {
                        "1660c5f3-b183-4e6c-a873-5d6bbd918224": {
                            "widgetId": "1660c5f3-b183-4e6c-a873-5d6bbd918224",
                            "defaultHeight": 100,
                            "defaultWidth": 400
                        }
                    }
                },
                "2": {
                    "type": "appbuilder",
                    "applicationId": 2,
                    "appDefinitionId": "3d590cbc-4907-4cc4-b0b1-ddf2c5edf297",
                    "instanceId": "138d5d48-9339-6ae5-6f96-1812d38e1e6d",
                    "state": "Initialized"
                },
                "13": {
                    "type": "sitemembers",
                    "applicationId": 13,
                    "collectionType": "Open",
                    "smtoken": "189e3da1bd292f9f2c0b4416bcdaca87e158bbe737ef42f18981c21a37df63c6e8f9a27f4dd396d2df894d5ea08d39414a3c0dfde0bfc8610fd3c84c73b3dbce2bd813f55c080b39df8d1f3e174e7a7bd53abe24f14950c5a58a3c54ebd917f3",
                    "smcollectionId": "1c0ce759-060e-4bff-8e3d-7208a9e6dda2"
                },
                "15": {
                    "type": "ecommerce",
                    "applicationId": 15,
                    "appDefinitionId": "55a88716-958a-4b91-b666-6c1118abdee4",
                    "magentoStoreId": "46922251",
                    "packageName": "ecommerce",
                    "widgets": {
                        "30b4a102-7649-47d9-a60b-bfd89dcca135": {
                            "widgetId": "30b4a102-7649-47d9-a60b-bfd89dcca135",
                            "defaultHeight": 585,
                            "defaultWidth": 960
                        },
                        "adbeffec-c7df-4908-acd0-cdd23155a817": {
                            "widgetId": "adbeffec-c7df-4908-acd0-cdd23155a817",
                            "defaultHeight": 150,
                            "defaultWidth": 500
                        },
                        "f72a3898-8520-4b60-8cd6-24e4e20d483d": {
                            "widgetId": "f72a3898-8520-4b60-8cd6-24e4e20d483d",
                            "defaultHeight": 600,
                            "defaultWidth": 840
                        },
                        "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c": {
                            "widgetId": "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c",
                            "defaultHeight": 50,
                            "defaultWidth": 200
                        },
                        "cd54a28f-e3c9-4522-91c4-15e6dd5bc514": {
                            "widgetId": "cd54a28f-e3c9-4522-91c4-15e6dd5bc514",
                            "defaultHeight": 50,
                            "defaultWidth": 200
                        },
                        "c614fb79-dbec-4ac7-b9b0-419669fadecc": {
                            "widgetId": "c614fb79-dbec-4ac7-b9b0-419669fadecc",
                            "defaultHeight": 50,
                            "defaultWidth": 200
                        },
                        "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a": {
                            "widgetId": "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a",
                            "defaultHeight": 150,
                            "defaultWidth": 800
                        },
                        "ae674d74-b30b-47c3-aba0-0bd220e25a69": {
                            "widgetId": "ae674d74-b30b-47c3-aba0-0bd220e25a69",
                            "defaultHeight": 150,
                            "defaultWidth": 220
                        },
                        "fbd55289-7136-4c7d-955c-3088974c1f93": {
                            "widgetId": "fbd55289-7136-4c7d-955c-3088974c1f93",
                            "defaultHeight": 150,
                            "defaultWidth": 220
                        }
                    },
                    "state": "Initialized"
                },
                "16": {
                    "type": "public",
                    "applicationId": 16,
                    "appDefinitionId": "13016589-a9eb-424a-8a69-46cb05ce0b2c",
                    "appDefinitionName": "Comments",
                    "instance": "YHr7cugLVYcxhsYWJmjzN86u6xHRY10IDHC9vF5VpGk.eyJpbnN0YW5jZUlkIjoiMTM4ZTdlNjAtOTYwOC00MjVhLTYzZTEtODg3NzIzMzQxYWNjIiwic2lnbkRhdGUiOiIyMDE0LTEyLTExVDExOjAxOjA1LjAzNloiLCJ1aWQiOiJkYzZmYWJiZC0wNTU0LTRjN2YtYTcwMi0wYjcyNjY2OTEyNzciLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS4yNTQvNjUyMzgiLCJkZW1vTW9kZSI6ZmFsc2V9",
                    "sectionPublished": true,
                    "sectionMobilePublished": false,
                    "sectionSeoEnabled": true,
                    "widgets": {
                        "130165ba-4eeb-4a87-3121-a3cf2a86d2ca": {
                            "widgetUrl": "https://comments.wixplus.com/",
                            "widgetId": "130165ba-4eeb-4a87-3121-a3cf2a86d2ca",
                            "refreshOnWidthChange": true,
                            "mobileUrl": "https://comments.wixplus.com/mobile.html",
                            "published": true,
                            "mobilePublished": true,
                            "seoEnabled": true
                        }
                    },
                    "appRequirements": {
                        "requireSiteMembers": false
                    },
                    "installedAtDashboard": true,
                    "permissions": {
                        "revoked": false
                    }
                },
                "17": {
                    "type": "public",
                    "applicationId": 17,
                    "appDefinitionId": "12aacf69-f3fb-5334-2847-e00a8f13c12f",
                    "appDefinitionName": "Form Builder",
                    "instance": "0nZahKoo33uNHKBELL1E8JTa_e21yxyZj8N1nqs-2Aw.eyJpbnN0YW5jZUlkIjoiMTM5MWUxYWItMzQ3OC0yY2U2LWZmMWEtMzhiN2VlODE1MmEwIiwic2lnbkRhdGUiOiIyMDE0LTEyLTExVDExOjAxOjA1LjAzNloiLCJ1aWQiOiJkYzZmYWJiZC0wNTU0LTRjN2YtYTcwMi0wYjcyNjY2OTEyNzciLCJwZXJtaXNzaW9ucyI6Ik9XTkVSIiwiaXBBbmRQb3J0IjoiOTEuMTk5LjExOS4yNTQvNjUyMzgiLCJkZW1vTW9kZSI6ZmFsc2V9",
                    "sectionPublished": true,
                    "sectionMobilePublished": false,
                    "sectionSeoEnabled": true,
                    "widgets": {
                        "12aacf69-f3be-4d15-c1f5-e10b8281822e": {
                            "widgetUrl": "http://www.123contactform.com/wix.php",
                            "widgetId": "12aacf69-f3be-4d15-c1f5-e10b8281822e",
                            "refreshOnWidthChange": true,
                            "mobileUrl": "http://www.123contactform.com/wix.php?forcemobile=1",
                            "published": true,
                            "mobilePublished": true,
                            "seoEnabled": true
                        }
                    },
                    "appRequirements": {
                        "requireSiteMembers": false
                    },
                    "installedAtDashboard": true,
                    "permissions": {
                        "revoked": true
                    }
                }
            },
            "premiumFeatures": [],
            "geo": "ISR",
            "languageCode": "en",
            "previewMode": false,
            "userId": "dc6fabbd-0554-4c7f-a702-0b7266691277",
            "siteMetaData": {
                "contactInfo": {
                    "companyName": "",
                    "phone": "",
                    "fax": "",
                    "email": "",
                    "address": ""
                },
                "adaptiveMobileOn": false,
                "preloader": {
                    "enabled": false
                },
                "quickActions": {
                    "socialLinks": [],
                    "colorScheme": "dark",
                    "configuration": {
                        "quickActionsMenuEnabled": false,
                        "navigationMenuEnabled": true,
                        "phoneEnabled": false,
                        "emailEnabled": false,
                        "addressEnabled": false,
                        "socialLinksEnabled": false
                    }
                }
            }
        },
        "siteHeader": {
            "id": "f0f897fc-b6a2-4024-845b-a165de8041f9",
            "userId": "47556985-fc22-47fd-8d3a-6da9221c128f"
        },
        "siteId": "f0f897fc-b6a2-4024-845b-a165de8041f9",
        "viewMode": "site",
        "adData": {
            "topLabel": "<span class=\"smallMusa\">(Wix-Logo) </span>Create a <span class=\"smallLogo\">Wix</span> site!",
            "topContent": "100s of templates<br />No coding needed<br /><span class=\"emphasis spacer\">Start now >></span>",
            "footerLabel": "<div class=\"adFootBox\"><div class=\"siteBanner\" ><div class=\"siteBanner\"><div class=\"wrapper\"><div class=\"bigMusa\">(Wix Logo)</div><div class=\"txt shd\" style=\"color:#fff\">This site was created using </div> <div class=\"txt shd\"><a  href=\"http://www.wix.com?utm_campaign=vir_wixad_live&experiment_id=abtestbanner49310001\" style=\"color:#fff\"> WIX.com. </a></div> <div class=\"txt shd\" style=\"color:#fff\"> Create your own for FREE <span class=\"emphasis\"> >></span></div></div></div></div></div>",
            "adUrl": "http://www.wix.com/lpviral/en900viral?utm_campaign=vir_wixad_live&experiment_id=abtestbanner49310001"
        },
        "mobileAdData": {
            "footerLabel": "7c3dbd_67131d7bd570478689be752141d4e28a.jpg",
            "adUrl": "http://www.wix.com/"
        },
        "googleAnalytics": "",
        "requestModel": {
            "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36",
            "localStorage": {}
        },
        "currentUrl": {
            "full": "http://sh0801.wix.com/mocksite",
            "protocol": "http:",
            "host": "sh0801.wix.com",
            "hostname": "sh0801.wix.com",
            "port": "",
            "path": "/mocksite",
            "search": "",
            "query": {},
            "hash": ""
        },
        "documentServicesModel": {
            "originalTemplateId": "21bb4070-0fcb-41eb-87d6-bb35db2a803f",
            "version": 1417099695927,
            "revision": 97,
            "metaSiteData": {
                "externalUriMappings": [],
                "favicon": "",
                "indexable": true,
                "metaTags": [
                    {
                        "name": "keywords",
                        "value": "",
                        "isProperty": false
                    },
                    {
                        "name": "description",
                        "value": "",
                        "isProperty": false
                    },
                    {
                        "name": "fb_admins_meta_tag",
                        "value": "",
                        "isProperty": false
                    }
                ],
                "suppressTrackingCookies": false,
                "thumbnail": ""
            },
            "editorSessionId": "0f563610-7f65-4e71-9c90-981a2c0eb151",
            "permissionsInfo": {
                isOwner: true,
                permissions: []
            },
            "neverSaved": false,
            "publicUrl": "http://user.wix.com/example",
            "usedMetaSiteNames": ["site1", "site2", "site_name"],
            "userInfo": {
                "name": "user",
                "email": "user@wix.com"
            },
            "siteName": "example",
            "customHeadTags": ""
        }
    };

    function getDefaultPathsConfig() {
        return {
            siteData: [
                {path: ['saveInvalidationCount'], optional: false},
                {path: ['mobileDeletedCompsMap'], optional: true},
                {path: ['committedMobilePages'], optional: true},
                {path: ['origin'], optional: true},
                {path: ['deletedPagesMap'], optional: false},
                {path: ['dockedRuntimeLayout'], optional: false},
                {path: ['rendererModel'], optional: false},
                {path: ['wixapps'], optional: true},
                {path: ['compsToUpdateAnchors'], optional: true},
                {path: ['rootsRenderedInMobileEditor'], optional: true},
                {path: ['runtime'], optional: true},
                {path: ['renderFlags'], optional: true},
                {path: ['serviceTopology'], optional: true},
                {path: ['platform'], optional: true},
                {path: ['pagesPlatformApplications'], optional: true},
                {path: ['activeModes'], optional: false},
                {path: ['routers'], optional: true},
                {path: ['urlFormatModel'], optional: true},
                {path: ['documentServicesModel', 'neverSaved'], optional: true},
                {path: ['documentServicesModel', 'autoSaveInfo'], optional: true},
                {path: ['documentServicesModel', 'metaSiteData', 'useOnboarding'], optional: true},
                {path: ['orphanPermanentDataNodes'], optional: true}
            ],
            fullJson: [{path: ['pagesData'], optional: false}]
        };
    }

    function addPageWithDefaultsInner(id, pageComps, mobilePageComps, pointers, isPopup) {
        var dataCreationMethods = testUtils.mockFactory.mockSiteData();
        var page = isPopup ? dataCreationMethods.addPopupPageWithDefaults(id, pageComps, mobilePageComps) : dataCreationMethods.getPageWithDefaults(id, pageComps, mobilePageComps);
        var pagePointer = pointers.page.getNewPagePointer(id);
        this.full.set(pagePointer, page);
        return this;
    }

    var dalEnhancements = {
        addPageWithDefaults: function (pointers, id, pageComps, mobilePageComps) {
            return addPageWithDefaultsInner.call(this, id, pageComps, mobilePageComps, pointers, false);
        },
        addPopupPageWithDefaults: function(pointers, id, popupComps, mobilePopupComps) {
            return addPageWithDefaultsInner.call(this, id, popupComps, mobilePopupComps, pointers, true);
        },
        addDesktopComps: function (pointers, comps, pagePointer) {
            var childrenContainer = pointers.components.getChildrenContainer(pagePointer);
            _.forEach(comps, function (comp) {
                this.push(childrenContainer, comp);
            }, this);
            return this;
        },
        addData: function (pointers, item, pageId) {
            var pointer = pointers.data.getDataItem(item.id, pageId || 'masterPage');
            this.set(pointer, item);
            return this;
        },

        addProperties: function (pointers, item, pageId) {
            var pointer = pointers.data.getPropertyItem(item.id, pageId || 'masterPage');
            this.set(pointer, item);
            return this;
        },
        addBehaviors: function(pointers, item, pageId) {
            var pointer = pointers.data.getBehaviorsItem(item.id, pageId);
            this.set(pointer, item);
            return this;
        },
        addGeneralTheme: function (pointers, colors, fonts) {
            addDataItems.call(this, pointers, {
                id: 'THEME_DATA',
                color: colors || [],
                font: fonts || []
            }, 'masterPage', utils.constants.DATA_TYPES.theme);
            return this;
        },
        addDesignItem: function(pointers, item, pageId) {
            var pointer = pointers.data.getDesignItem(item.id, pageId);
            this.set(pointer, item);
            return this;
        },
        addConnections: function(pointers, item, pageId) {
            var pointer = pointers.data.getConnectionsItem(item.id, pageId);
            this.set(pointer, item);
            return this;
        },
        setDocumentType: function (pointers, documentType) {
            var pointer = pointers.general.getDocumentType();
            this.set(pointer, documentType);
        },

        addStyle: function(pointers, styleItem) {
            if (styleItem && styleItem.id) {
                var pointer = pointers.general.getAllTheme();
                var valueToMerge = {};
                valueToMerge[styleItem.id] = styleItem;
                this.merge(pointer, valueToMerge);
            }
            return this;
        }
    };

    function getOrCreateCompMode(ps, compPointer, modeType) {
        var modeId;
        var existingModes = componentModes.getComponentModesByType(ps, compPointer, modeType);
        if (existingModes.length) {
            modeId = _.first(existingModes).modeId;
        } else {
            modeId = componentModes.getModeToAddId(ps, compPointer);
            componentModes.addComponentModeDefinition(ps, modeId, compPointer, modeType);
        }

        return modeId;
    }

    function addDataItems(pointers, item, pageId, dataType) {
        if (_.isArray(item)) {
            _.forEach(item, function (i) {
                var dataPointer = pointers.data.getItem(dataType, i.id, pageId);
                this.set(dataPointer, i);
            }, this);
        } else {
            var dataPointer = pointers.data.getItem(dataType, item.id, pageId);
            this.set(dataPointer, item);
        }
    }


    function mockPrivateServicesInner(siteData, isRealDAL, jsonPaths) {
        siteData = siteData || testUtils.mockFactory.mockSiteData(defaultSiteModel);
        var ps = new MockPrivateServices(fullFunctionalityConfig.getConfig(), {
            siteData: siteData,
            dataLoadedRegistrar: function () {
            }
        }, isRealDAL, jsonPaths);

        createDisplayedPagesFromFullInASillyWay(ps);

        var enhancements = _.mapValues(dalEnhancements, function (method) {
            return method.bind(ps.dal, ps.pointers);
        });


        //dalEnhancements.addPageWithDefaults = dalEnhancements.addPageWithDefaults.bind(ps.dal, ps.pointers);
        _.assign(ps.dal, enhancements);
        //TODO: Alissa this isn't good, but will be removed I hope
        ps.siteAPI.setCurrentPage = function (pageId) {
            siteData.setCurrentPage(pageId);
        };
        return ps;
    }

    function createDisplayedPagesFromFullInASillyWay(ps) {
        var pagesData = ps.dal.full.getByPath(['pagesData']);
        ps.dal.full.setByPath(['pagesData'], pagesData);
    }

    function mockPrivateServicesWithRealDAL(siteData, extraPathsConfig) {
        var pathsConfig;
        if (_.isArray(extraPathsConfig)) {
            pathsConfig = {
                siteData: extraPathsConfig
            };
        }
        pathsConfig = extraPathsConfig || {siteData: []};
        pathsConfig.fullJson = pathsConfig.fullJson || [];
        pathsConfig.fullJson = pathsConfig.fullJson.concat(getDefaultPathsConfig().fullJson);
        pathsConfig.siteData = pathsConfig.siteData.concat(getDefaultPathsConfig().siteData);
        var jsons = siteData || getSiteDataWithPages({'mainPage': {}});

        pathsConfig = _.mapValues(pathsConfig, function (jsonPaths) {
            return _.uniq(jsonPaths, function (pathObj) {
                return pathObj.path.join('.');
            });
        });

        return mockPrivateServicesInner(jsons, true, pathsConfig);
    }

    function mockPrivateServices(siteData) {
        return mockPrivateServicesInner(siteData);
    }

    function createMockCompWithSkinDataProperties(compType, data, properties) {
        var result = testUtils.mockFactory.createCompStructure(compType, data, properties);
        var compTypeStyles = componentsDefinitionsMap[compType].styles;
        result.compStructure.skin = _(compTypeStyles)
            .values()
            .first();
        if (data) {
            result.compData.type = _.first(componentsDefinitionsMap[compType].dataTypes);
        }
        if (properties) {
            result.compProps.type = componentsDefinitionsMap[compType].propertyType;
        }
        return result;
    }

    function getSiteDataWithPages(pages, showOnAllPageComps) {
        var siteData = testUtils.mockFactory.mockSiteData(defaultSiteModel, true);
        siteData.pagesData = _.pick(siteData.pagesData, 'masterPage');

        if (experiment.isOpen('connectionsData')) {
            siteData.pagesData.masterPage.data.connections_data = {};
        }

        _.forEach(showOnAllPageComps, function (showOnAllPageComp) {
            siteData.pagesData.masterPage.structure.children = _.reject(siteData.pagesData.masterPage.structure.children, {id: showOnAllPageComp.id});
            siteData.pagesData.masterPage.structure.children.push(showOnAllPageComp);
        });

        _.forOwn(pages, function (pageStuff, pageId) {
            var pageDefinition = {
                structure: {
                    type: 'Page',
                    id: pageId,
                    componentType: 'mobile.core.components.Page',
                    skin: 'wysiwyg.viewer.skins.page.TransparentPageSkin',
                    layout: {
                        width: 980,
                        height: 500,
                        y: 0
                    },
                    dataQuery: '#' + pageId,
                    propertyQuery: '#' + pageId,
                    components: pageStuff.components || [],
                    mobileComponents: pageStuff.mobileComponents || []
                },
                data: {
                    document_data: pageStuff.data || {},
                    design_data: pageStuff.design || {},
                    component_properties: pageStuff.props || {},
                    theme_data: {},
                    behaviors_data: pageStuff.behaviors || {}
                },
                title: pageStuff.title
            };

            if (experiment.isOpen('connectionsData')) {
                pageDefinition.data.connections_data = pageStuff.connections || {};
            }

            siteData.pagesData[pageId] = pageDefinition;
        });

        if (_.size(siteData.pagesData) === 2) { //masterPage + one other page, we want to make sure the other page is our current page
            var pageId = _.findKey(siteData.pagesData, function(v, k){
                return k !== 'masterPage';
            });
            siteData.setCurrentPage(pageId);
        }

        return siteData;
    }

    function mockDalInners(siteData) {
        siteData = siteData || testUtils.mockFactory.mockSiteData(null, true);

        var inners = core.SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);

        var dalConfig = _.pick(fullFunctionalityConfig.getConfig(), ['pathsInJsonData', 'isReadOnly', 'origin']);

        var fullJsonCache = inners.cache.getBoundCacheInstance(true);
        var jsons = {
            siteData: siteData,
            fullJson: inners.fullPagesData
        };
        var fullJsonDal = new DAL(jsons, _.noop/* TODO replace with real function */, fullJsonCache, dalConfig);
        var fullJsonUpdater = new FullJsonUpdater(fullJsonDal, inners.pointers, inners.displayedDal);

        inners.fullJsonCache = fullJsonCache;
        inners.fullJsonDal = fullJsonDal;
        inners.fullJsonUpdater = fullJsonUpdater;

        return inners;
    }

    function createCompStructureAndAddToPage(componentType, ps, pageId, data, props, isMobile, id) {
        var compStructureAndData = testUtils.mockFactory.createCompStructure(componentType, data, props, id);
        if (data) {
            ps.dal.addData(compStructureAndData.compData, pageId);
        }

        if (props) {
            ps.dal.addProperties(compStructureAndData.compProps, pageId);
        }

        var viewMode = isMobile ? utils.constants.VIEW_MODES.MOBILE : utils.constants.VIEW_MODES.DESKTOP;
        var pagePointer = ps.pointers.components.getPage(pageId, viewMode);
        var pageChildrenPointer = ps.pointers.components.getChildrenContainer(pagePointer);
        ps.dal.push(pageChildrenPointer, compStructureAndData.compStructure);

        return compStructureAndData.compStructure;

    }

    return {
        mockPrivateServices: mockPrivateServices,
        mockPrivateServicesWithRealDAL: mockPrivateServicesWithRealDAL,
        mockDalInners: mockDalInners,
        getSiteDataWithPages: getSiteDataWithPages,
        mockComponentInPage: createCompStructureAndAddToPage,
        createMockCompWithStyleDataProperties: createMockCompWithSkinDataProperties,
        getOrCreateCompMode: getOrCreateCompMode
    };
});
