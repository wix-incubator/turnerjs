define.resource("angularResource", {

    production: {
        ANGULAR_RESOURCE_URL_DEBUG: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.21/angular.js',
        ANGULAR_RESOURCE_URL_MIN: '//ajax.googleapis.com/ajax/libs/angularjs/1.2.21/angular.min.js',
        JQUERY_RESOURCE_URL_DEBUG: '//static.parastorage.com/services/third-party/jquery/2.1.1/dist/jquery-2.1.1.auto-noconflict.js',
        JQUERY_RESOURCE_URL_MIN: '//static.parastorage.com/services/third-party/jquery/2.1.1/dist/jquery-2.1.1.auto-noconflict.min.js'
    },

    // TODO NMO 8/31/14 1:05 PM - Resources relevant only for the NGCore experiment.
    ngCore: {
        ANGULAR_RESOURCE_URL_DEBUG: '//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.0/angular.js',
        ANGULAR_RESOURCE_URL_MIN: '//ajax.googleapis.com/ajax/libs/angularjs/1.3.0-rc.0/angular.min.js'
    },

    _angularConfigToLoad: function () {
        var resource = this.production;
        if(W.isExperimentOpen("NGCore")) {
            resource = this.ngCore;
        }
        if (W.Config.getDebugMode() === 'debug') {
            return resource.ANGULAR_RESOURCE_URL_DEBUG;
        } else {
            return resource.ANGULAR_RESOURCE_URL_MIN;
        }
    },

    _jQueryConfigToLoad: function () {
        if (W.Config.getDebugMode() === 'debug') {
            return this.production.JQUERY_RESOURCE_URL_DEBUG;
        } else {
            return this.production.JQUERY_RESOURCE_URL_MIN;
        }
    },


    //here for TPA Usage ONLY.  Remove this when TPA is refactored.
    Resource: function (context) {
        if (_.isUndefined(window.angular)) {
            var onComplete = function () {
                context.onComplete();
            };
            // TODO NMO 3/18/14 4:31 PM - Revise this constant Angular URL.
            context.scriptloader.loadScript(
                { url: this._angularConfigToLoad() },
                { onLoad: onComplete}
            );
        } else {
            context.onComplete();
        }
    },

    loadAngularResources: function (resourceNames, scriptLoader, callbackOnDone) {
        callbackOnDone = callbackOnDone || _.noop;
        var resources = [];
        resources = _.union(resources, resourceNames);
        resources.push(this._angularConfigToLoad());
        resources.push(this._jQueryConfigToLoad());

        var angularResourcesToLoad = [];
        _.forOwn(resources, function(resource) {
            angularResourcesToLoad.push(this._loadAngularResource(resource, scriptLoader));
        }, this);

        Q.all(angularResourcesToLoad).then(callbackOnDone);
    },

    _loadAngularResource: function (resourceName, scriptLoader) {
        var deferred = Q.defer();
        scriptLoader.loadScript(
            { url: resourceName },
            {
                onLoad: function () {
                    deferred.resolve();
                },
                onFailed: function () {
                    deferred.reject();
                }
            });
        return deferred.promise;
    }
});
