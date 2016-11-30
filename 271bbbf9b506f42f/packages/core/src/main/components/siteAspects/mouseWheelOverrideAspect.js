define(['lodash', 'core/core/siteAspectsRegistry'],
    function (_, siteAspectsRegistry) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function MouseWheelOverrideAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._isOverride = false;

        }

        function onMouseWheel(event) {
            if (typeof window === 'undefined'){
                return;
            }
            // remove default behavior
            event.preventDefault();

            //scroll without smoothing
            window.scrollBy(0, -event.wheelDelta / 2);
        }


        MouseWheelOverrideAspect.prototype = {
            overrideMouseWheel: function () {
                var body = window.document.body;
                if (this._isOverride) {
                    return;
                }
                if (body.onwheel !== undefined) {
                    body.addEventListener('wheel', onMouseWheel);
                } else if (body.onmousewheel !== undefined) {
                    body.addEventListener('mousewheel', onMouseWheel);
                } else {
                    return;
                }
                this._isOverride = true;
            },

            releaseMouseWheel: function () {
                var body = window.document.body;
                body.removeEventListener('wheel', onMouseWheel);
                body.removeEventListener('mousewheel', onMouseWheel);
                this._isOverride = false;
            },

            isOverride: function () {
                return this._isOverride;
            }
        };

        siteAspectsRegistry.registerSiteAspect('mouseWheelOverride', MouseWheelOverrideAspect);
    });
