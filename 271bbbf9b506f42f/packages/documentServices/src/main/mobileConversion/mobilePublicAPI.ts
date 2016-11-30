'use strict';

import * as mobileActions from 'documentServices/mobileConversion/mobileActions';
import * as mobileConversionFacade from 'documentServices/mobileConversion/mobileConversionFacade';
import * as mobileSettings from 'documentServices/mobileConversion/mobileSettings';
import * as mergeAggregator from 'documentServices/mobileConversion/modules/mergeAggregator';
import 'documentServices/mobileConversion/modules/mobilePresetStructureHandler';

var MobilePublicAPI = {
    methods: {
        mobile: {
            reLayoutPage: {dataManipulation: mobileActions.reLayoutPage, noBatching: true},
            isOptimized: mobileSettings.isOptimized,
            enableOptimizedView: {dataManipulation: mobileSettings.enableOptimizedView},
            mobileOnlyComponents: {
                enableBackToTopButton: {dataManipulation: mobileActions.enableBackToTopButton},
                isMobileOnlyComponent: mobileActions.isMobileOnlyComponent,
                isMobileOnlyComponentExistOnStructure: mobileActions.isMobileOnlyComponentExistOnStructure,
                mobileOnlyComps: mobileActions.mobileOnlyComps,
                getTinyMenuDefaultPosition: mobileActions.getTinyMenuDefaultPosition
            },
            hiddenComponents: {
                get: mobileActions.hiddenComponents.getFiltered,
                hide: {dataManipulation: mobileActions.hiddenComponents.hide, isUpdatingAnchors: true},
                show: {
                    dataManipulation: mobileActions.hiddenComponents.show,
                    noBatching: true,
                    getReturnValue: mobileActions.getMobileComponentToShow
                }
            },
            actionBar: {
                enable: {dataManipulation: mobileSettings.actionBar.enable},
                isEnabled: mobileSettings.actionBar.isEnabled,
                colorScheme: {
                    get: mobileSettings.actionBar.colorScheme.get,
                    set: {dataManipulation: mobileSettings.actionBar.colorScheme.set}
                },
                actions: {
                    enable: {dataManipulation: mobileSettings.actionBar.actions.enable},
                    getEnabled: mobileSettings.actionBar.actions.getEnabled,
                    update: {dataManipulation: mobileSettings.actionBar.actions.update},
                    get: mobileSettings.actionBar.actions.get,
                    options: mobileSettings.QUICK_ACTIONS_PROPS,
                    socialLinksOptions: mobileSettings.SOCIAL_LINKS_IDS
                }
            },
            preloader: {
                enable: {dataManipulation: mobileSettings.preloader.enable},
                isEnabled: mobileSettings.preloader.isEnabled,
                update: {dataManipulation: mobileSettings.preloader.update},
                get: mobileSettings.preloader.get,
                options: mobileSettings.PRELOADER_PROPS
            }
        },

        mobileConversion: {
            resetMobileLayoutOnAllPages: {
                dataManipulation: mobileConversionFacade.resetMobileLayoutOnAllPages,
                isUpdatingAnchors: false,
                noBatching: true
            },
            testUtils: {
                prepare: mobileConversionFacade.prepareForConversion,
                exec: mobileConversionFacade.execConversion,

                apply: {
                    dataManipulation: mobileConversionFacade.applyConversion,
                    isUpdatingAnchors: false,
                    noBatching: true
                }
            }
        }
    },
    initMethod: function (ps: ps) {
        mergeAggregator.initialize(ps);
        mobileActions.initialize(ps);
        mobileSettings.initialize(ps);
    }
};

export = MobilePublicAPI;
