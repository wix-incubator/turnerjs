define(['lodash', 'utils', 'core/core/siteAspectsRegistry'], function (_, utils, siteAspectsRegistry) {
    'use strict';

    var SOUND_MANAGER_ISREADY_POLLING_INTERVAL_IN_MS = 10;
    var currentSoundManagerPollingInterval = SOUND_MANAGER_ISREADY_POLLING_INTERVAL_IN_MS;
    var INTERVAL_GROWTH_FACTOR = 1.5;
    var POLLING_INTERVAL_LIMIT_IN_MS = 10 * 1000;

    function getSoundManagerSetupConfig(aspect, customSettings) {
        return _.assign({
            url: getSoundManagerBaseUrl(aspect.siteAPI.getSiteData().serviceTopology),
            flashVersion: 9,
            preferFlash: false,
            useHTML5Audio: true,
            forceUseGlobalHTML5Audio: false,
            html5PollingInterval: 100,
            onready: function () {
                aspect.soundManagerReady = true;
            }
        }, customSettings || {});
    }

    function resetCurrentPollingInterval() {
        currentSoundManagerPollingInterval = SOUND_MANAGER_ISREADY_POLLING_INTERVAL_IN_MS;
    }

    function getSoundManagerBaseUrl(serviceTopology) {
        var scriptsLocation = serviceTopology.scriptsDomainUrl;
        if (!utils.stringUtils.endsWith(scriptsLocation, '/')) {
            scriptsLocation += '/';
        }
        return scriptsLocation + 'services/third-party/soundmanager2/V2.97a.20150601/';
    }

    function onHTMLAudioLoadError(aspect) {
        if (setupSoundManager !== setupSoundManagerFallback) {
            aspect.soundManagerReady = false;
            aspect.soundManagerOnResetup = true;
            aspect.siteAPI.forceUpdate();
            setupSoundManager = setupSoundManagerFallback;
            setupSoundManagerFallback(aspect);
        }
    }


    function setupSoundManagerFallback(aspect) {
        var setupConfig = getSoundManagerSetupConfig(aspect, {
            preferFlash: true,
            useHTML5Audio: false,
            onready: function () {
                aspect.soundManagerReady = true;
                aspect.soundManagerOnResetup = false;
                aspect.siteAPI.forceUpdate();
            }
        });
        aspect.soundManager.destruct();
        aspect.soundManager.reset().setup(setupConfig);
        aspect.soundManager.beginDelayedInit();

    }

    var setupSoundManager = function (aspect) {
        var setupConfig = getSoundManagerSetupConfig(aspect);
        aspect.soundManager.setup(setupConfig);
        setTimeout(function () {
            tryLoadingSoundManager(aspect);
        }, currentSoundManagerPollingInterval);
    };

    var tryLoadingSoundManager = function (aspect) {
        if (aspect.soundManager === null) {
            require(['SoundManager'], function (soundManager) {
                aspect.soundManager = soundManager.getInstance();
                tryLoadingSoundManager(aspect);
            });
        } else if (aspect.soundManagerReady) {
            aspect.siteAPI.forceUpdate();
            resetCurrentPollingInterval();
        } else if (POLLING_INTERVAL_LIMIT_IN_MS > currentSoundManagerPollingInterval) {
            setupSoundManager(aspect);
            currentSoundManagerPollingInterval *= INTERVAL_GROWTH_FACTOR;
        } else {
            resetCurrentPollingInterval();
            utils.log.verbose("Failed to setup SoundManager.");
        }
    };

    var shouldForceHTML5Audio = function (siteData) {
        var usedBrowser = siteData.browser;
        return (usedBrowser && usedBrowser.safari === true);
    };

    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     *
     */
    function AudioAspect(aspectSiteApi) {
        this.siteAPI = aspectSiteApi;
        this.nowPlayingComp = null;
        this.soundManagerReady = false;
        this.soundManagerOnResetup = false;
        this.soundManager = null;
        this.shouldForceHTML5Audio = shouldForceHTML5Audio(aspectSiteApi.getSiteData());
    }

    AudioAspect.prototype = {
        loadSoundManagerAPI: function () {
            tryLoadingSoundManager(this);
        },

        isSoundManagerReady: function () {
            return this.soundManagerReady;
        },
        isSoundManagerOnResetup: function () {
            return this.soundManagerOnResetup;
        },
        onHTML5ErrorTryToReloadWithFlash: function(){
            onHTMLAudioLoadError(this);
        },
        createAudioObj: function (config) {
            if (!this.soundManagerReady) {
                this.loadSoundManagerAPI();
                return false;
            }

            if (config.id && this.soundManager.getSoundById(config.id)) {
                this.soundManager.destroySound(config.id);
            }
            return this.soundManager.createSound(config);
        },

        isCompPlaying: function (comp) {
            return this.nowPlayingComp === comp.props.id;
        },

        updatePlayingComp: function (comp) {
            if (!this.soundManagerReady) {
                this.loadSoundManagerAPI();
            }
            this.nowPlayingComp = comp.props.id;
            this.siteAPI.forceUpdate();
        },

        updatePausingComp: function () {
            this.nowPlayingComp = '';
            if (this.soundManagerReady) {
                this.siteAPI.forceUpdate();
            }
        }
    };

    siteAspectsRegistry.registerSiteAspect('AudioAspect', AudioAspect);
    return AudioAspect;
});
