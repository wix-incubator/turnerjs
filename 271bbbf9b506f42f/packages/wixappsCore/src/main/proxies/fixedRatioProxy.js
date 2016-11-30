define(["react", "wixappsCore/proxies/mixins/baseCompositeProxy", "lodash"], function (React, baseCompositeProxy, _) {
    'use strict';

    function getFixedRatioLayout(layout, aspectRatio) {
        var isLegalLayoutProp = function(prop) {
            return layout[prop] && !(_.isString(layout[prop]) && layout[prop].slice(-1) === '%');
        };

        var fixedRatioLayout = {};
        if (isLegalLayoutProp('width')) {
            fixedRatioLayout.width = parseInt(layout.width, 10);
            fixedRatioLayout.height = Math.floor(fixedRatioLayout.width / aspectRatio);
        } else if (isLegalLayoutProp('height')) {
            fixedRatioLayout.height = parseInt(layout.height, 10);
            fixedRatioLayout.width = Math.floor(fixedRatioLayout.height * aspectRatio);
        } else if (isLegalLayoutProp('box-flex') || isLegalLayoutProp('boxFlex')) {
            fixedRatioLayout.position = "absolute";
            fixedRatioLayout.height = "100%";
            fixedRatioLayout.width = "100%";
            fixedRatioLayout.top = "0px";
            fixedRatioLayout.left = "0px";
        } else {
            throw new Error("FixedRatioProxy's child proxy does not receive legal layout properties");
        }

        return fixedRatioLayout;
    }

    /**
     * For flex implementations of fixed layout proxy we are using a 'fake' image in the correct propotions
     * to enforce aspect ratio with the browser. see http://jsfiddle.net/whgjLmrc/
     * @param orientation
     * @param aspectRatio
     * @returns {*}
     */
    function getStaticImageClass(orientation, aspectRatio){
        var aspectRatiosMap = {
            '1': "data:image/gif;base64,R0lGODlhAQABAIAAAP7//wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
            '1.77': "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAE0lEQVR42mP4TyFgGDVg1AAgAAC2ij3fb7PW1wAAAABJRU5ErkJggg=="
        };

        var styles = {
            'position': 'relative',
            'top': '0px',
            'bottom': '0px',
            'left': '0px',
            'right': '0px',
            'visibility': 'hidden'
        };

        if (orientation === 'vertical') {
            styles.minWidth = '100%';
        } else {
            styles['min-height'] = '100%';
        }

        if (!aspectRatiosMap[aspectRatio]){
           throw ("This ratio is not supported by the current map: " + aspectRatio);
        }

        return React.DOM.img({
            src: aspectRatiosMap[aspectRatio],
            style: styles
        });
    }

    function getOrientationStyles(orientation){
        var styles = {
            vertical: {
                "width" : "100%",
                "minWidth":"100%",
                position: "relative"
            },
            horizontal: {
                "height":"100%",
                "min-height":"100%",
                position: "relative"
            }
        };
        return styles[orientation];
    }

    /**
     * @class proxies.FixedRatio
     * @extends proxies.mixins.baseCompositeProxy
     */
    return {
        mixins: [baseCompositeProxy],

        renderProxy: function() {
            var childrenDefinitions = this.getCompProp("items");
            var aspectRatio = parseFloat(this.getCompProp('aspectRatio'));

            if (childrenDefinitions.length !== 1) {
                throw new Error('FixedRatioProxy can only contain one child');
            }
            if (!aspectRatio) {
                throw new Error('FixedRatioProxy did not receive any aspect ratio');
            }

            var childDef = childrenDefinitions[0];
            var childStyle = this.getStyleDef(childDef);

            //this part is for normal proxies with known width or height
            if (childDef.layout && !childDef.layout['box-flex'] && !childDef.layout.boxFlex) {
                _.merge(childStyle, getFixedRatioLayout(childStyle, aspectRatio));
                return this.renderChildProxy(childDef, 0, childStyle);
            }

            //if we are in flex mode
            var staticImg = getStaticImageClass(this.props.orientation, aspectRatio);
            var orientationStyles = getOrientationStyles(this.props.orientation);

            return React.DOM.div({style: _.merge(orientationStyles, childStyle)}, staticImg, this.renderChildProxy(childDef, 0, getFixedRatioLayout(childStyle, aspectRatio)));
        }
    };
});
