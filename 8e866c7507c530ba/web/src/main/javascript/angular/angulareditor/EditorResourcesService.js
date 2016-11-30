W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('angularEditor').factory('editorResources', function ($sce) {
        var resourceManager = W.Resources;
        var configManager = W.Config;


        var isDebugMode = (function () {
            var _isDebugMode = false;

            resource.getResources(['mode', 'debugModeArtifacts'], function (res) {
                if (res.mode.debug || res.debugModeArtifacts.wysiwyg || res.debugModeArtifacts.web) {
                    _isDebugMode = true;
                }
            });

            return _isDebugMode;
        })();

        function isPreview() {
            return configManager.env.isEditorInPreviewMode();
        }

        var isLocal = (function() {
            var webPath = resourceManager.resources.topology.wysiwyg;
            if(webPath) {
                webPath = webPath.toLowerCase();
                if(webPath.indexOf("localhost") >=0 ||
                    webPath.indexOf("wysiwyg.pita.wixpress.com") >= 0 ||
                    webPath.indexOf("127.0.0.1") >= 0) {
                        return true;
                }
            }
            return false ;
        })();


        /**
         * Overcome x-domain issues when getting HTML partials
         * (editor.wix.com/_partials/web/ is mapped to the static servers - static.wix.com/services/web/ )
         * @returns {string}
         */
        function _getBaseAngularPath() {
            if (isDebugMode && isLocal) {
                return resourceManager.resources.topology.wysiwyg + '/javascript/angular';
            } else {
                return 'angular'; // using fixed strings for the $templateCache
            }
        }

        var _angularPath = _getBaseAngularPath();


        function getAngularPartialPath(str) {
            if (str[0] !== '/') {
                str = '/' + str;
            }
            var partialPath = (_angularPath + str).toLowerCase();

            return $sce.trustAsResourceUrl(partialPath);
        }

        function translate(key, bundleName, fallback) {
            return resourceManager.get(bundleName || 'EDITOR_LANGUAGE', key, fallback);
        }

        return {
            'topology': resourceManager.resources.topology,
            'getAngularPartialPath': getAngularPartialPath,
            'translate': translate,
            'getMediaStaticUrl': function() {
                return configManager.getMediaStaticUrl();
            },
            'isDebugMode': isDebugMode,
            'isPreview': isPreview
        };
    });
});