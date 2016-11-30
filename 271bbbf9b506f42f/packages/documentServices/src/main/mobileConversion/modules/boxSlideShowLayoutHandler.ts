'use strict';

import * as _ from 'lodash';
import * as core from 'core';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import * as experiment from 'experiment';

var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;

function findAndDeAttachShownOnAllSlidesComponents(websiteStructurePage) {
    _.forEach(websiteStructurePage.components || websiteStructurePage.children, function (desktopComp) {

        if (boxSlideShowCommon.isBoxOrStripSlideShowComponent(desktopComp.componentType)) {
            var masterComponents = boxSlideShowCommon.getShownOnAllSlidesFromChildrenByStructure(desktopComp.components);
            if (masterComponents.length > 0) {
                deAttachShownOnAllSlidesComponent(masterComponents, desktopComp, websiteStructurePage);
            }
        }

        if (desktopComp.components) {
            findAndDeAttachShownOnAllSlidesComponents(desktopComp);
        }
    });
}

function deAttachShownOnAllSlidesComponent(masterComponents, oldParent, newParent) {
    _.forEach(masterComponents, function (masterComp) {
        var oldParentChildrenArray = oldParent.components;
        var indexInOldParent = _.findIndex(oldParentChildrenArray, {id: masterComp.id});
        conversionUtils.reparentComponent(newParent, masterComp);
        oldParentChildrenArray.splice(indexInOldParent, 1);
    });
}

function findAndFixSlideShowComponents(pageId, mobileSiteStructure, websiteStructurePage, areComponentsAddedOrDeleted) {
    _.forEach(mobileSiteStructure.components || mobileSiteStructure.children, function (mobileComp) {

        if (boxSlideShowCommon.isBoxOrStripSlideShowComponent(mobileComp.componentType)) {
            var desktopComp = conversionUtils.getComponentByIdFromStructure(mobileComp.id, websiteStructurePage);
            fixSlideShowComponent(pageId, mobileComp, desktopComp, areComponentsAddedOrDeleted);
        }

        if (mobileComp.components) {
            findAndFixSlideShowComponents(pageId, mobileComp, websiteStructurePage, areComponentsAddedOrDeleted);
        }
    });
}

function fixSlideShowComponent(pageId, mobileComp, desktopComp, areComponentsAddedOrDeleted) {
    var boxSlides = boxSlideShowCommon.getSlidesFromChildrenByStructure(mobileComp.components);

    if (areComponentsAddedOrDeleted) {
        var maxSlideHeight = (<any> _.max(boxSlides, 'layout.height')).layout.height;
        _.forEach(boxSlides, function (slide) {
            slide.layout.x = 0;
            slide.layout.y = 0;
            slide.layout.height = maxSlideHeight;
        });

        mobileComp.layout.height = maxSlideHeight;
        fixAnchors(mobileComp, boxSlides);
        leaveSpaceForSlideNavigationDotsByEnlargingAnchor(mobileComp, boxSlides);
    }

    fixSlidesOrder(mobileComp, desktopComp);
}

function fixAnchors(mobileComp, mobileSlides) {
    if (experiment.isOpen('removeJsonAnchors')) {
        return;
    }

    _.forEach(mobileSlides, function (slide) {
        slide.layout.anchors = [];

        //create a top-top anchor with all other slides - not critically important - just to be equivalent with what happens on desktop
        _.forEach(mobileSlides, function (otherSlide) {
            if (!_.isEqual(slide, otherSlide)) {
                var anchorToOtherSlide = {
                    distance: 0,
                    fromComp: slide.id,
                    locked: true,
                    originalValue: 0,
                    targetComponent: otherSlide.id,
                    type: 'TOP_TOP',
                    topToTop: null
                };
                slide.layout.anchors.push(anchorToOtherSlide);
            }
        });

        //create a bottom-parent anchor with the box parent - this IS important
        var anchorToSlidesParent = {
            distance: 0,
            fromComp: slide.id,
            locked: true,
            originalValue: mobileComp.layout.height,
            targetComponent: mobileComp.id,
            type: 'BOTTOM_PARENT',
            topToTop: null
        };

        slide.layout.anchors.push(anchorToSlidesParent);
    });
}

function leaveSpaceForSlideNavigationDotsByEnlargingAnchor(mobileComp, mobileSlides) {
    var propertyItem: any = _.get(mobileComp, ['conversionData', 'props']);
    if (!propertyItem) {
        return;
    }
    var dotsMinimalOffset = propertyItem.showNavigationDots ? propertyItem.navigationDotsMargin * 2 + propertyItem.navigationDotsSize : 0;

    if (dotsMinimalOffset > 0) {
        findAndFixAllChildrenBottomParentAnchorsDistance(mobileSlides, dotsMinimalOffset);
    }
}

function findAndFixAllChildrenBottomParentAnchorsDistance(mobileSlides, minimalDistance) {
    _.forEach(mobileSlides, function (slide) {
        _.forEach(slide.components, function (slideChild) {
            _.forEach(slideChild.layout.anchors, function (anchor: Anchor) {
                if (anchor.type === 'BOTTOM_PARENT' && anchor.distance > 0 && anchor.distance < minimalDistance) {
                    anchor.distance = minimalDistance;
                }
            });
        });
    });
}

function fixSlidesOrder(mobileComp, desktopComp) {
    var desktopChildrenIdsOrderMap = {};
    _.forEach(desktopComp.components, function (comp, index) {
        desktopChildrenIdsOrderMap[comp.id] = index;
    });

    mobileComp.components = _.sortBy(mobileComp.components, function (mobileChild:any) {
        return desktopChildrenIdsOrderMap[mobileChild.id];
    });
}

function fixSlideShowComponentsFromMobilePage(pageId: string, mobileSiteStructurePage: Component | MasterPageComponent, websiteStructurePage: Component | MasterPageComponent, areComponentsAddedOrDeleted: boolean): void {
    findAndFixSlideShowComponents(pageId, mobileSiteStructurePage, websiteStructurePage, areComponentsAddedOrDeleted);
}

function fixSlideShowComponentsFromComponentsArray(pageId: string, mobileCompsArray: Component[], desktopCompsArray: Component[], areComponentsAddedOrDeleted: boolean): void {
    var mobilePageStructure = {components: mobileCompsArray};
    var desktopPageStructure = {components: desktopCompsArray};
    findAndFixSlideShowComponents(pageId, mobilePageStructure, desktopPageStructure, areComponentsAddedOrDeleted);
}

function handleSlideShowComponentsBeforeAlgorithm(websiteStructurePage: Component | MasterPageComponent): void {
    findAndDeAttachShownOnAllSlidesComponents(websiteStructurePage);
}

export {
    fixSlideShowComponentsFromMobilePage,
    fixSlideShowComponentsFromComponentsArray,
    handleSlideShowComponentsBeforeAlgorithm
}