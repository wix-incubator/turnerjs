define(['lodash', 'siteUtils', 'wixappsCore', 'santaProps', 'components'], function (_, siteUtils, wixapps, santaProps/*, components*/) {
    'use strict';

    var proxyFactory = wixapps.proxyFactory;
    var logicFactory = wixapps.logicFactory;
    var extensions = {};
    var proxyExtensions = {};
    var logicExtensions = {};
    var mixinExtensions = [];

	function resetMixinExtensions() {
		_.forEach(mixinExtensions, function (mixinExtension) {
			_.remove(mixinExtension.mixin.mixins, mixinExtension.extension);
		});
		mixinExtensions = [];
	}

	return {
		extendCompClasses: function extendCompClasses() {
            _.forEach(extensions, function (extensionsForComponent, compType) {
                _.forEach(extensionsForComponent, function(extension) {
                    siteUtils.compFactory.extend(compType, extension);
                    santaProps.propsSelectorsFactory.registerComponentExtension(compType, extension);
                });
            });
        },
        registerCompExtension: function registerCompExtension(compType, extension) {
            extensions[compType] = (extensions[compType] || []).concat([extension]);
        },
        registerProxyExtension: function (proxyType, extension) {
            proxyExtensions[proxyType] = extension;
        },
        registerMixinExtension: function(mixin, extension) {
            var registeredMixinExtension = _.find(mixinExtensions, function(mixinExtension){/*eslint lodash/matches-prop-shorthand:0*/ /*eslint lodash/matches-shorthand:0*/
                return mixinExtension.mixin === mixin;
            });

            if (registeredMixinExtension) {
                registeredMixinExtension.extension = extension;
            } else {
                mixinExtensions.push({
                    mixin: mixin,
                    extension: extension
                });
            }
        },
        extendProxyClasses: function () {
            _.forEach(proxyExtensions, function (extension, proxyType) {
                proxyFactory.extend(proxyType, extension);
            });
        },
        extendCompMixinClasses: function() {
            _.forEach(mixinExtensions, function(mixinExtension) {
                mixinExtension.mixin.mixins = mixinExtension.mixin.mixins || [];
                mixinExtension.mixin.mixins.push(mixinExtension.extension);
            });
        },

        registerLogicExtension: function (partId, extension) {
            logicExtensions[partId] = extension;
        },
        extendLogicClasses: function () {
            _.forEach(logicExtensions, function (extension, partId) {
                logicFactory.extend(partId, extension);
            });
        },

        resetAllExtensions: function() {
            extensions = {};
            proxyExtensions = {};
            logicExtensions = {};
	        resetMixinExtensions();
        }
    };
});
