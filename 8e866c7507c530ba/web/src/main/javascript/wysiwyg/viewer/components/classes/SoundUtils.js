/**@class wysiwyg.viewer.components.classes.SoundUtils*/
define.Class('wysiwyg.viewer.components.classes.SoundUtils', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.statics({
        SOUND_API_RESOURCE_NAME: 'comp.soundManagerApi'
    });

    def.resources(['W.Config', 'topology']);

    /**@lends wysiwyg.viewer.components.classes.SoundUtils*/
    def.methods({
        setupSoundManagerFailure: function (reason) {
            LOG.reportError('Failed to load SoundManager2 API: ' + reason.toString(), 'wysiwyg.viewer.components.classes.SoundUtils');
        },

        isSoundApiDefined: function () {
            return (!!window.soundManagerDeferred);
        },

        isSoundApiReady: function () {
            return (window.soundManagerDeferred && window.soundManagerDeferred.isFulfilled());
        },

        waitForApiReady: function () {
            return window.soundManagerDeferred.promise;
        },

        getSoundApiResource: function () {
            var dfd = Q.defer();

            if (window.soundManager) {
                dfd.resolve(window.soundManager);
            }

            resource.getResourceValue(
                this.SOUND_API_RESOURCE_NAME,
                function () {
                    dfd.resolve();
                },
                function (reason) {
                    dfd.reject(reason);
                }
            );

            return dfd.promise;
        },

        loadApi: function () {
            var soundApiFileUrl,
                soundApiFolder;

            if (this.isSoundApiDefined()) {
                return;
            }

            window.soundManagerDeferred = Q.defer();
            soundApiFileUrl = this._getSoundApiFileName();
            soundApiFolder = this._getSoundApiFolder();
            define.resource(this.SOUND_API_RESOURCE_NAME).withUrls(soundApiFileUrl).withTrials(3).withTimeBetween(3000);

            this.getSoundApiResource()
                .then(function () {
                    return this.setupSoundManager(soundApiFolder);
                }.bind(this), this.setupSoundManagerFailure)
                .then(function () {
                    window.soundManagerDeferred.resolve(window.soundManager);
                })
                .done();
        },

        setupSoundManager: function (apiFolder) {
            var dfd = Q.defer(),
                setupConfig = {
                    url: apiFolder,
                    flashVersion: 9,
                    useHTML5Audio: true,
                    html5PollingInterval: 100,
                    onready: function () {
                        dfd.resolve();
                    },
                    ontimeout: function () {
                        this.setupSoundManagerFailure('Setup sound manager timed out');
                        dfd.reject();
                    }.bind(this)
                };

            if (this._forceHTML5Audio()) {
                setupConfig.useHTML5Audio = true;
                setupConfig.preferFlash = false;
            }

            window.soundManager.setup(setupConfig);
            window.soundManager.beginDelayedInit();

            return dfd.promise;
        },

        //Safari with flash doesn't work well. we want to force safari to use HTML5Audio
        _forceHTML5Audio: function () {
            //detecting safari (mootools):
            var isSafari = (Browser.name === 'safari'),

            //using swfobject (included in bootstrap) to detect flash
            hasFlash = swfobject.hasFlashPlayerVersion('9.0.0.0'),

            //only force in Macs
            isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? true : false;

            return isMacLike && isSafari && hasFlash;
        },

        _getSoundApiFileName: function () {
            // return this._getSoundApiFolder() + 'soundmanager2-nodebug-jsmin.js';
            return this._getSoundApiFolder() + 'soundmanager2.js';
        },

        _removeProtocol: function (url) {
            var newUrl = url;
            if (url === undefined) {
                return;
            }
            if (newUrl.indexOf('http://') === 0) {
                newUrl = newUrl.substr(5);
            }
            if (newUrl.indexOf('https://') === 0) {
                newUrl = newUrl.substr(6);
            }
            return newUrl;
        },

        getAudioFullUrl: function (uri) {
            var audioPath;
            if (uri.indexOf('http://') === 0) {
                return uri;
            }

            audioPath = this.resources.W.Config.getServiceTopologyProperty('staticAudioUrl');
            if (audioPath[audioPath.length - 1] !== '/') {
                audioPath += '/';
            }
            audioPath += uri;
            return audioPath;
        },

        _getSoundApiFolder: function () {
            var path = this._removeProtocol(this.resources.topology.wysiwyg);
            if (path[path.length - 1] !== "/") {
                path += '/';
            }
            path += 'resources/wysiwyg/media/soundmanager2new/';
            return path;
        }
    });
});