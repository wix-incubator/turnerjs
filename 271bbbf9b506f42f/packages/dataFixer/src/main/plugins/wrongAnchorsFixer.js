define(['lodash', 'dataFixer/helpers/anchorCyclesHelper'], function (_, anchorCyclesHelper) {
    'use strict';

    var unresizableComponents = {
        'wysiwyg.common.components.anchor.viewer.Anchor': true,
        'wysiwyg.common.components.subscribeform.viewer.SubscribeForm': true,
        'wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget': true,
        'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer': true,
        'wixapps.integration.components.AppPart': true,
        'wixapps.integration.components.AppPart2': true,
        'wixapps.integration.components.common.minipart': true,
        'wysiwyg.common.components.onlineclock.viewer.OnlineClock': true,
        'wysiwyg.common.components.weather.viewer.Weather': true,
        'wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton': true,
        'wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow': true,
        'wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer': true,
        'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton': true,
        'wysiwyg.viewer.components.ContactForm': true,
        'wysiwyg.viewer.components.FacebookShare': true,
        'wysiwyg.viewer.components.FiveGridLine': true,
        'wysiwyg.viewer.components.FlickrBadgeWidget': true,
        'wysiwyg.viewer.components.ItunesButton': true,
        'wysiwyg.viewer.components.LinkBar': true,
        'wysiwyg.viewer.components.PayPalButton': true,
        'wysiwyg.viewer.components.PinterestFollow': true,
        'wysiwyg.viewer.components.VKShareButton': true,
        'wysiwyg.viewer.components.WFacebookComment': true,
        'wysiwyg.viewer.components.WGooglePlusOne': true,
        'wysiwyg.viewer.components.mobile.TinyMenu': true
    };

    var notAnchorableComponents = {
        'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton': true,
        'wysiwyg.viewer.components.tpapps.TPAGluedWidget': true,
        'mobile.core.components.Page': true,
        'wixapps.integration.components.AppPage': true
    };

    function removeAnchorsForNotAnchorableComponents(component) {
        //TODO: bring this back to life after solving the fixed footer thing CLNT-2889
        //|| (component.layout && component.layout.fixedPosition === true)
        if (notAnchorableComponents[component.componentType]) {
            component.layout.anchors = [];
        }

    }

    function fixTopTopToBeLocked(anchor) {
        if (anchor.type === "TOP_TOP") {
            anchor.locked = true;
        }
    }

    /**
     * return the height of the bounding rect surrounding the component
     */
    function getBoundingHeight(height, width, angleInDegrees) {
        var currentAngleInRadians = (angleInDegrees || 0) * Math.PI / 180;
        return parseInt(Math.abs(width * Math.sin(currentAngleInRadians)) + Math.abs(height * Math.cos(currentAngleInRadians)), 10);
    }

    /**
     * return the top of the bounding rect surrounding the component
     */
    function getBoundingY(y, height, boundingHeight) {
        return parseInt(y - (boundingHeight - height) / 2, 10);
    }

    function getCompBottom(comp) {
        return comp.layout && (comp.layout.y + comp.layout.height);
    }

    function getCompAnchors(comp) {
        return comp.layout && comp.layout.anchors || [];
    }

    //we are looking for a bottom bottom anchor to closeCircleComp
    function isCompAnchorTreeClosingCircle(comp, closeCircleComp, closeCircleCompBottom, siblingsMap, visitedComps) {
        if (visitedComps[comp.id] || getCompBottom(comp) > closeCircleCompBottom) {
            return;
        }
        visitedComps[comp.id] = true;
        var anchors = getCompAnchors(comp);
        _.remove(anchors, function (anchor) {
            if (anchor.targetComponent === closeCircleComp.id) {
                return true;
            }
            if (anchor.type !== "BOTTOM_PARENT") {
                if (!siblingsMap[anchor.targetComponent]) {
                    return true;
                }
                isCompAnchorTreeClosingCircle(siblingsMap[anchor.targetComponent], closeCircleComp, closeCircleCompBottom, siblingsMap, visitedComps);
            }
            return false;
        });
    }

    function breakCircleIfThereIsOne(anchor, closeCircleComp, siblingsMap) {
        //circles might be created by bottom_top anchors
        if (anchor.type !== "BOTTOM_TOP") {
            return;
        }
        var targetComp = siblingsMap[anchor.targetComponent];
        var targetCompAnchors = getCompAnchors(targetComp);
        //yes, there are loops that small...
        _.remove(targetCompAnchors, {targetComponent: closeCircleComp.id});

        //the bottom of the target comp should be outside of the from comp so not interesting
        var topTopAnchors = _.filter(targetCompAnchors, {type: 'TOP_TOP'});
        var closeCircleCompBottom = getCompBottom(closeCircleComp) + 10;
        _.forEach(topTopAnchors, function (anch) {
            if (siblingsMap[anch.targetComponent]) {
                isCompAnchorTreeClosingCircle(siblingsMap[anch.targetComponent], closeCircleComp, closeCircleCompBottom, siblingsMap, {});
            }
        });

    }

    function updateAnchorsToMasterPage(parentComponent, anchors) {
        if (parentComponent.type !== 'Document') {
            return;
        }
        _.forEach(anchors, function (anchor) {
            if (anchor.targetComponent === 'SITE_STRUCTURE') {
                anchor.targetComponent = 'masterPage';
            }
        });
    }


    function preventSameTypeAnchorsBetweenTwoComps(component, anchors, siblingsMap) {
        anchors = _.reject(anchors, {'type': "BOTTOM_PARENT"});
        _.forEach(anchors, function (anchor) {
            var targetComp = siblingsMap[anchor.targetComponent];
            if (!targetComp) {
                return;
            }
            var targetCompAnchorsForComp = _.filter(getCompAnchors(targetComp), {
                targetComponent: component.id,
                type: anchor.type
            });
            _.forEach(targetCompAnchorsForComp, function (targetCompAnchor) {
                var compWithBiggerY = component.layout.y < targetComp.layout.y ? targetComp : component;
                var anchorToRemove = component.layout.y < targetComp.layout.y ? targetCompAnchor : anchor;
                _.remove(compWithBiggerY.layout.anchors, function (higherCompAnchor) {
                    return higherCompAnchor === anchorToRemove;
                });
            });
        });
    }

    function removeAnchorsNotInTheSameScope(children) {
        _.forEach(children, function (component) {
            var anchors = getCompAnchors(component);
            anchors = _.reject(anchors, {'type': "BOTTOM_PARENT"});
            _.remove(anchors, function (anchor) {
                return !_.some(children, {id: anchor.targetComponent});
            });
        });
    }

    function fixAnchorAndReturnIsStaying(anchor, parentComponent, siblingsMap) {
        var parentId = parentComponent.id;
        var targetComponent = siblingsMap[anchor.targetComponent];
        if (anchor.type === "BOTTOM_PARENT") {
            targetComponent = anchor.targetComponent === parentId ? parentComponent : null;
        }

        if (!targetComponent) {
            return false;
        }

        if (anchor.type === "BOTTOM_BOTTOM" && unresizableComponents[targetComponent.componentType]) {
            return false;
        }

        if (anchor.type !== 'BOTTOM_PARENT' &&
            (notAnchorableComponents[targetComponent.componentType] ||
                //TODO: this is temp until we find a solution for this crap..
            (targetComponent.componentType === 'wysiwyg.viewer.components.HeaderContainer' &&
            targetComponent.layout && targetComponent.layout.fixedPosition === true))) {
            return false;
        }

        var targetValue;
        if (targetComponent.layout && _.isNumber(targetComponent.layout.height) && _.isNumber(targetComponent.layout.y)) {
            var targetLayout = targetComponent.layout;
            var targetBoundingHeight = getBoundingHeight(targetLayout.height, targetLayout.width, targetLayout.rotationInDegrees);
            var targetBoundingY = getBoundingY(targetLayout.y, targetLayout.height, targetBoundingHeight);
            targetValue = (anchor.type === "BOTTOM_PARENT" || anchor.type === "BOTTOM_BOTTOM") ? targetBoundingHeight : targetBoundingY;
        } else {
            targetValue = 0;
        }

        anchor.originalValue = Math.min(anchor.originalValue, targetValue);
        return true;
    }

    function removeInvalidAnchors(anchors) {
        _.remove(anchors, function (anchor) {
            return anchor.distance === null || isNaN(anchor.distance);
        });
    }

    function fixParentAnchors(parentComponent, childrenPropertyName) {
        var isPage = !!childrenPropertyName;

        if (isPage) {
            removeAnchorsForNotAnchorableComponents(parentComponent);
        }
    }

    function fixAnchorsForPageAndChildren(parentComponent, childrenPropertyName) {
        fixParentAnchors(parentComponent, childrenPropertyName);
        return fixAnchorsForChildrenInScope(parentComponent, childrenPropertyName);
    }

    function fixAnchorsForChildrenInScope(parentComponent, childrenPropertyName) {
        var children = childrenPropertyName ? parentComponent[childrenPropertyName] : parentComponent.components;

        if (_.isEmpty(children)) {
            return;
        }
        var siblingsMap = _.transform(children, function (result, comp) {
            result[comp.id] = comp;
        }, {}, this);

        removeAnchorsNotInTheSameScope(children); //do it before break circle runs
        _.forEach(children, function (component) {
            var anchors = getCompAnchors(component);
            removeInvalidAnchors(anchors);
            removeAnchorsForNotAnchorableComponents(component);
            updateAnchorsToMasterPage(parentComponent, anchors);
            preventSameTypeAnchorsBetweenTwoComps(component, anchors, siblingsMap);
            _.remove(anchors, function (anchor) {
                fixTopTopToBeLocked(anchor);
                var shouldStay = fixAnchorAndReturnIsStaying(anchor, parentComponent, siblingsMap);
                if (shouldStay) {
                    breakCircleIfThereIsOne(anchor, component, siblingsMap);


                }
                return !shouldStay;
            });

            fixAnchorsForChildrenInScope(component);
        });
    }

    function childrenAnchorsExist(childrenArr) {
        var childComp = _.first(childrenArr);
        return !!(_.get(childComp, 'layout.anchors'));
    }

    /**
     * @exports utils/dataFixer/plugins/wrongAnchorsFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            var desktopChildrenPropertyName = 'components';
            if (structureData) {
                if (structureData.type === "Document") {
                    //TODO: update the server to add id to the document node
                    structureData = _.clone(pageJson.structure);
                    structureData.id = "masterPage";
                    pageJson.structure = structureData;
                    desktopChildrenPropertyName = 'children';
                }
                if (childrenAnchorsExist(structureData[desktopChildrenPropertyName])) {
                    fixAnchorsForPageAndChildren(structureData, desktopChildrenPropertyName);
                }
                if (childrenAnchorsExist(structureData.mobileComponents)) {
                    fixAnchorsForPageAndChildren(structureData, 'mobileComponents');
                    anchorCyclesHelper.fixBottomTopBottomBottomCycles(structureData.mobileComponents);
                }
            }
        }
    };

    return exports;
});
