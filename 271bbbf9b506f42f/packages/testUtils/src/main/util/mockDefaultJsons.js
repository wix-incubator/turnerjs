define(['lodash', 'experiment'], function(_, experiment){
    'use strict';

    var siteModel = {
        santaBase: '',
        viewMode: 'site',
        requestModel: {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2704.84 Safari/537.36"
        },
        deletedPagesMap: {},
        pagesData: {
            masterPage: {
                data: {
                    document_data: {
                        currentPage: {
                            type: 'Page',
                            id: 'currentPage',
                            isPopup: false,
                            pageUriSEO:'currentPage',
                            title: 'currentPage',
                            pageTitleSEO: 'currentPage',
                            descriptionSEO: '',
                            metaKeywordsSEO: '',
                            pageBackgrounds: {
                                mobile: {
                                    ref: ''
                                },
                                desktop: {
                                    ref: ''
                                }
                            }
                        },
                        masterPage: {
                            id: 'masterPage',
                            type: 'Document',
                            mainPage: '#currentPage',
                            mainPageId: 'currentPage'
                        },
                        MAIN_MENU: {
                            "type": "Menu",
                            "id": "MAIN_MENU",
                            "items": []
                        },
                        CUSTOM_MAIN_MENU: {
                            "type": "CustomMenu",
                            "id": "CUSTOM_MAIN_MENU",
                            "name": "Custom Main Menu",
                                "items": []
                        },
                        CUSTOM_MENUS: {
                            "type": "CustomMenusCollection",
                            "id": "CUSTOM_MENUS",
                            "menus": [
                                "#CUSTOM_MAIN_MENU"
                            ]
                        }
                    },
                    component_properties: {},
                    design_data: {},
                    behaviors_data: {},
                    theme_data: {THEME_DATA: {color: [
                        "#FFFFFF", "#FFFFFF", "#000000", "#ED1C24", "#0088CB", "#FFCB05", "#727272", "#B0B0B0", "#FFFFFF", "#727272", "#B0B0B0", "#FFFFFF", "#F9F9F9", "#D4D4D2", "#A8A8A7", "#414141", "#D9F0FD", "#BEE5FB", "#7FCCF7", "#40667C", "#213D4D", "#ADC6F8", "#83A8F0", "#155DE9", "#0E3E9B", "#071F4E", "#C4AEDD", "#9C7FBA", "#663898", "#442565", "#221333", "#E5FAD1", "#CAE5AF", "#9BCB6C", "#4E6636", "#27331B"
                    ], font: [
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}',
                        'normal normal normal 14px/1.4em Arial {color_15}'
                    ], siteBg: "none 0px 0px center top cover no-repeat no-repeat fixed {color_11}"}}
                },
                structure: {
                    id: "masterPage",
                    children: [
                        {
                            componentType: "wysiwyg.viewer.components.HeaderContainer",
                            id: "SITE_HEADER",
                            type: "Container",
                            components: [],
                            layout: {x: 0, y: 0, width: 980, height: 100},
                            skin: 'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen'
                        },
                        {
                            componentType: "wysiwyg.viewer.components.FooterContainer",
                            id: "SITE_FOOTER",
                            type: "Container",
                            components: [],
                            layout: {x: 0, y: 600, width: 980, height: 100},
                            skin: 'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen'
                        },
                        {
                            componentType: "wysiwyg.viewer.components.PagesContainer",
                            id: "PAGES_CONTAINER",
                            type: "Container",
                            layout: {x: 0, y: 100, width: 980, height: 500},
                            components: [
                                {
                                    componentType: "wysiwyg.viewer.components.PageGroup",
                                    components: [],
                                    id: "SITE_PAGES",
                                    type: "Container",
                                    layout: {x: 0, y: 0, width: 980, height: 500}
                                }
                            ],
                            skin: 'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen'
                        }
                    ],
                    mobileComponents: [],
                    layout: {
                        y: 0
                    },
                    type: "Document"
                }
            },
            currentPage: {
                data: {
                    document_data: {},
                    component_properties: {},
                    theme_data: {},
                    design_data: {},
                    behaviors_data: {}
                },
                structure: {
                    componentType: 'mobile.core.components.Page',
                    id: "currentPage",
                    dataQuery: "#currentPage",
                    components: [],
                    type: 'Page',
                    layout: {},
                    style: 'p1',
                    skin: 'wysiwyg.viewer.skins.page.BasicPageSkin'
                },
                title: 'currentPage',
                pageUriSEO: 'currentPage'
            }
        },
        currentUrl: {
            host: 'testhost.com',
            query: {},
            full: 'full'
        },
        publicModel: {
            pageList: {
                mainPageId: "currentPage",
                pages:[{
                    pageId: 'currentPage',
                    urls: ['https://Base1/sites/currentPage', 'https://Base2/sites/currentPage'],
                    pageJsonFileName: 'currentPage',
                    title: 'currentPage',
                    pageUriSEO: 'currentPage'
                }],
                topology: [
                    {
                        baseUrl:"https://Base1",
                        parts:"sites/{filename}"
                    },
                    {
                        baseUrl:"https://Base2",
                        parts:"sites/{filename}"
                    }
                ],
                masterPage: ['https://Base1/sites/masterPage', 'https://Base2/sites/masterPage'],
                masterPageJsonFileName: 'masterPage'
            },
            externalBaseUrl: 'mockExternalBaseUrl',
            siteRevision: 1
        },
        rendererModel: {
            previewMode: false,
            clientSpecMap: {
                10: {
                    type: 'tpa',
                    applicationId: 11,
                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad9',
                    instanceId: '1234',
                    demoMode: true
                },
                12: {
                    type: 'tpa',
                    applicationId: 13,
                    appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad8',
                    instanceId: '',
                    demoMode: false
                },
                16: {
                    type: 'appbuilder',
                    applicationId: 16,
                    appDefinitionId: '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297',
                    instanceId: 'EA8957FF-C900-4339-94ED-FF6B83501955',
                    state: 'Template'
                }
            },
            siteMetaData: {
                contactInfo: {
                    address: "",
                    companyName: "",
                    fax: "",
                    phone: ""
                },
                quickActions: {
                    colorScheme: 'dark',
                    configuration: {
                        addressEnabled: false,
                        emailEnabled: false,
                        navigationMenuEnabled: true,
                        phoneEnabled: false,
                        quickActionsMenuEnabled: false,
                        socialLinksEnabled: false
                    }
                },
                socialLinks: [],
                adaptiveMobileOn: true
            },
            //siteId: "a2051fe8-e3d3-42b6-a3c0-f72b2fce5732",
            metaSiteId: "8bf9f82c-51ba-4ede-a31c-d84ec021d869",
            siteInfo: {
                "applicationType": "HtmlWeb",
                "documentType": "UGC",
                "siteId": "bac442c8-b7fd-4bd1-ac7e-096fec2fc800",
                "siteTitleSEO": "reactest"
            },
            languageCode: 'en',
            wixCodeModel: {
                appData: {
                    codeAppId: '55cf7bc1-13c8-495f-9181-838d935fa988'
                },
                signedAppRenderInfo: 'fake-scari-fake-scari-fake-scari'
            },
            runningExperiments: {}
        },
        externalBaseUrl: "",
        currentPage: 'currentPage',
        serviceTopology: {
            baseDomain: 'wix.com',
            appStoreUrl: 'http://editor.wix.com/wix-apps',
            staticMediaUrl: 'root/media',
            staticDocsUrl: 'http://media.wix.com/ugd',
            mediaRootUrl: 'root/',
            editorServerRoot: 'http://editor.wix.com/html/editor/web',
            serverName: 'barvaz.oger',
            wixCloudBaseDomain: 'wixcloudcasedomain',
            scriptsDomainUrl: 'http://static.parastorage.com',
            publicStaticsUrl: 'http://static.parastorage.com/services/wix-public/1.182.0/',
            wixCloudEditorBaseUrl: 'http://editor.wix.com/wix-code-ide-server',
            wixCloudSiteExtensionsServiceUrl: 'http://editor.wix.com/wix-code-service',
            scriptsLocationMap: {
                "wixapps": "http://static.parastorage.com/services/wixapps/2.461.22",
                "santa-langs": "http://static.parastorage.com/services/santa-langs/1.339.0",
                "tpa": "http://static.parastorage.com/services/tpa/2.1062.0",
                "cloud-editor-integration": "http://static.parastorage.com/services/cloud-editor-integration/1.26.0",
                "santa-editor-versions": "http://static.parastorage.com/services/santa-editor-versions/1.180.0",
                "santa-resources": "http://static.parastorage.com/services/santa-resources/1.0.0",
                "bootstrap": "http://static.parastorage.com/services/bootstrap/2.1229.41",
                "ck-editor": "http://static.parastorage.com/services/ck-editor/1.87.3",
                "it": "http://static.parastorage.com/services/experiments/it/1.37.0",
                "santa": "http://static.parastorage.com/services/santa/1.1013.6",
                "skins": "http://static.parastorage.com/services/skins/2.1229.41",
                "media-gallery-g5": "http://static.parastorage.com/services/media-gallery-g5/1.202.0",
                "core": "http://static.parastorage.com/services/core/2.1229.41",
                "santa-editor": "http://static.parastorage.com/services/santa-editor/1.518.5",
                "sitemembers": "http://static.parastorage.com/services/sm-js-sdk/1.31.0",
                "automation": "http://static.parastorage.com/services/automation/1.23.0",
                "web": "http://static.parastorage.com/services/web/2.1229.41",
                "ecommerce": "http://static.parastorage.com/services/ecommerce/1.198.0",
                "hotfixes": "http://static.parastorage.com/services/experiments/hotfixes/1.15.0",
                "langs": "http://static.parastorage.com/services/langs/2.566.0",
                "santa-versions": "http://static.parastorage.com/services/santa-versions/1.410.0",
                "ut": "http://static.parastorage.com/services/experiments/ut/1.2.0",
                "dbsm-editor-app": "http://static.parastorage.com/services/dbsm-editor-app/1.39.0",
                "dbsm-viewer-app":"http://static.parastorage.com/services/dbsm-viewer-app/1.14.0",
                "wix-code-sdk": "http://static.parastorage.com/services/js-wixcode-sdk/1.48.0"
            },
            htmlEditorRootUrl: 'http://editor.wix.com/html/editor',
            basePublicUrl: 'http://www.wix.com'
        },
        wixBiSession: {
            viewerSessionId: 1234,
            initialTimeStamp: 1000
        },
        urlFormatModel: {
            format: 'hashBang',
            forbiddenPageUriSEOs: {},
            pageIdToResolvedUriSEO: {}
        },
        siteHeader: {}
    };

    var modelAddedInEditor = {
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

    var defaultPageData = {
        type: 'Page',
        title: 'page-title',
        hideTitle: true,
        icon: '',
        descriptionSEO: '',
        metaKeywordsSEO: '',
        pageTitleSEO: 'page-title-seo',
        pageUriSEO: 'page-uri-seo',
        hidePage: false,
        underConstruction: false,
        tpaApplicationId: 0,
        pageSecurity: {
            requireLogin: false
        },
        indexable: true,
        isLandingPage: false,
        pageBackgrounds: {
            desktop: {
                custom: true,
                ref: '#customBgImguz0',
                isPreset: true
            },
            mobile: {
                custom: true,
                ref: '#customBgImgsuf',
                isPreset: true
            }
        }
    };

    var defaultPageStructure = {
        structure: {
            type: 'Page',
            componentType: 'mobile.core.components.Page',
            components: [],
            mobileComponents: [],
            layout: {
                y: 0,
                x: 0
            }
        },
        data: {
            document_data: {},
            component_properties: {},
            design_data: {},
            theme_data: {},
            behaviors_data: {}
        }
    };

    var SITE_MODEL_WITH_CONNECTIONS_DATA = _.cloneDeep(siteModel);
    _.set(SITE_MODEL_WITH_CONNECTIONS_DATA, ['pagesData', 'masterPage', 'data', 'connections_data'], {});
    _.set(SITE_MODEL_WITH_CONNECTIONS_DATA, ['pagesData', 'currentPage', 'data', 'connections_data'], {});

    var PAGE_STRUCTURE_WITH_CONNECTIONS_DATA = _.cloneDeep(defaultPageStructure);
    _.set(PAGE_STRUCTURE_WITH_CONNECTIONS_DATA, ['data', 'connections_data'], {});

    function getSiteModel(){
        if (experiment.isOpen('connectionsData')) {
            return SITE_MODEL_WITH_CONNECTIONS_DATA;
        }
        return siteModel;
    }

    function getDefaultPageStructure() {
        if (experiment.isOpen('connectionsData')) {
            return PAGE_STRUCTURE_WITH_CONNECTIONS_DATA;
        }
        return defaultPageStructure;
    }

    return {
        get: {
            siteModel: getSiteModel,
            defaultPageStructure: getDefaultPageStructure
        },
        siteModel: siteModel,
        DSAdditionalSiteModel: modelAddedInEditor,
        defaultPageData: defaultPageData,
        defaultPageStructure: defaultPageStructure
    };
});
