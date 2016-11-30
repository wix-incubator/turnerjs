'use strict';

import * as _ from 'lodash';
import {mobileUtils} from 'siteUtils';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';

function rescaleLayout(comp : Component, factor: number) : void {
    const dims = ['x', 'y', 'width', 'height'];
    _.assign(comp.layout, _.zipObject(dims, _.map(dims, dim => Math.round(comp.layout[dim] * factor))));
}

function rescaleProportionally(component, scaleFactor) {
    rescaleLayout(component, scaleFactor);
    _.forEach(component.components, comp => rescaleProportionally(comp, scaleFactor));
    if (!conversionUtils.isTextComponent(component)) {
        return;
    }

    const averageFontSize = component.conversionData.averageFontSize || 0;
    const defaultFontSize = mobileUtils.convertFontSizeToMobile(averageFontSize, 1);
    component.layout.scale = averageFontSize * scaleFactor / defaultFontSize;
}

function rescaleComponentHeight(component: ComponentWithConversionData, options: {scaleFactor: number}) {
    if (conversionUtils.isTextComponent(component)) {
        component.layout.height = component.conversionData.averageFontSize || conversionConfig.DEFAULT_TEXT_HEIGHT;
        return;
    }

    const desktopHeight = component.layout.height;
    const fixedHeight = _.get(component.conversionData.fixedSize, 'height');
    if (_.isNumber(fixedHeight)) {
        component.layout.height = fixedHeight;
    } else if (_.get(component.conversionData, 'preserveAspectRatio', true)) {
        component.layout.height = Math.round(component.layout.height * options.scaleFactor);
    }

    const minHeight = component.conversionData.minHeight || 0;
    component.layout.height = minHeight < desktopHeight ? Math.max(component.layout.height, minHeight) : desktopHeight;

    const heightAccordingToChildren = conversionUtils.getHeightAccordingToChildren(component, component.components, false);
    component.layout.height = heightAccordingToChildren || component.layout.height;
}

function getHorizontalPadding(container: ComponentWithConversionData): number {
    if (container.conversionData.isTransparentContainer && container.conversionData.category !== 'column') {
        return 0;
    }

    const compSpecificMarginX = container.conversionData.marginX;
    if (_.isNumber(compSpecificMarginX)) {
        return compSpecificMarginX;
    }
    return (conversionUtils.shouldStretchToScreenWidth(container) ? conversionConfig.SITE_SEGMENT_PADDING_X : conversionConfig.COMPONENT_MOBILE_MARGIN_X) + _.get(container.conversionData, 'borderWidth', 0);
}

function getTopPadding(parent: ComponentWithConversionData, targetParent: ComponentWithConversionData, firstComponent: ComponentWithConversionData) {
    if (conversionUtils.shouldHaveTightYMargin(parent) || !firstComponent) {
        return 0;
    }

    if (firstComponent.conversionData.isTransparentContainer) {
        return getTopPadding(parent, targetParent, <ComponentWithConversionData>_.first(firstComponent.components));
    }

    if (conversionUtils.shouldStretchToScreenWidth(firstComponent) && !firstComponent.layout.y) {
        return 0;
    }

    return (targetParent.conversionData.borderWidth || 0) + (conversionUtils.shouldStretchToScreenWidth(targetParent) ? conversionConfig.SECTION_MOBILE_MARGIN_Y : conversionConfig.COMPONENT_MOBILE_MARGIN_Y);
}

function getCustomWidth(comp : ComponentWithConversionData, allowedWidth: number, settings?: {imageScaleFactor: number}) : number|undefined {
    if (comp.conversionData.category === 'photo' && settings.imageScaleFactor !== 1) {
        return Math.min(allowedWidth, Math.round(comp.layout.width * settings.imageScaleFactor));
    }

    return <number|undefined>_.get(comp.conversionData.fixedSize, 'width');
}

function getMarginForNextRow(a: ComponentWithConversionData, b: ComponentWithConversionData) {
    if (!b || b.conversionData.tightWithPreviousSibling) {
        return 0;
    }

    if (conversionUtils.isTextComponent(a) && !conversionUtils.isTextComponent(b)) {
        return conversionConfig.MARGIN_BETWEEN_TEXT_AND_NON_TEXT;
    }

    return conversionConfig.COMPONENT_MOBILE_MARGIN_Y;
}

function rescaleChildToFitParent(component: ComponentWithConversionData, allowedWidth: number, hasCustomWidth: boolean, settings) {
    if (component.conversionData.preset) {
        _.assign(component, component.conversionData.preset);
        return;
    }

    if (component.layout.width > allowedWidth ||
        component.conversionData.shouldEnlargeToFitWidth ||
        component.layout.width > conversionConfig.MIN_WIDTH_FOR_ENLARGE ||
        hasCustomWidth) {

        rescaleComponent(component, allowedWidth, settings);
    } else {
        rescaleComponentHeight(component, {scaleFactor: 1});
    }
}

function reorganizeChildren(parent : ComponentWithConversionData, targetParent: ComponentWithConversionData, allowedWidth : number, settings = {imageScaleFactor: 1}) {
    const topRightMargin = targetParent.conversionData.topRightMargin || [0, 0];
    const orderedComponents = _.sortBy(<ComponentWithConversionData[]>parent.components, comp => parent.conversionData.componentsOrder.indexOf(comp.id));
    const firstComponent = _.first(orderedComponents);
    const topPadding = getTopPadding(parent, targetParent, firstComponent);
    const horizontalPadding = getHorizontalPadding(targetParent);

    let y = topPadding;

    _.forEach(orderedComponents, function (curComp, i) {
        const isScreenWidth = conversionUtils.shouldStretchToScreenWidth(curComp);
        let marginLeft = horizontalPadding;
        let marginRight = horizontalPadding;
        const alignment = (curComp.conversionData.isInvisible || isScreenWidth) ? 'screen' : (parent.conversionData.naturalAlignment || 'center');

        if (y < topRightMargin[1] - topPadding) {
            marginRight = Math.max(marginRight, topRightMargin[0]);
            if (alignment === 'center') {
                marginLeft = marginRight;
            }
        }

        const allowedWidthWithoutMargins = allowedWidth - marginLeft - marginRight;

        const customWidth = isScreenWidth ? allowedWidth : getCustomWidth(curComp, allowedWidthWithoutMargins, settings);
        rescaleChildToFitParent(curComp, customWidth || allowedWidthWithoutMargins, _.isNumber(customWidth), settings);
        if (y < topRightMargin[1] && customWidth > allowedWidthWithoutMargins && !curComp.conversionData.isTransparentContainer) {
            y = topRightMargin[1];
            marginRight = marginLeft = horizontalPadding;
        }

        switch (alignment) {
            case 'screen': curComp.layout.x = 0; break;
            case 'left': curComp.layout.x = marginLeft; break;
            case 'center': curComp.layout.x = Math.round((allowedWidth - curComp.layout.width) / 2); break;
            case 'right': curComp.layout.x = allowedWidth - curComp.layout.width - marginRight; break;
        }

        curComp.layout.y = y - (curComp.conversionData.isInvisible && !i ? topPadding + 1 : 0);
        y += curComp.conversionData.isInvisible ? 1 : curComp.layout.height + getMarginForNextRow(curComp, orderedComponents[i + 1]);
    });
}

function rescaleComponent(component: ComponentWithConversionData, width: number, settings = {imageScaleFactor: 1}) {
    var scaleFactor = width / component.layout.width;
    component.layout.width = width;
    const nextSettings = {imageScaleFactor: component.conversionData.descendantImageScaleFactor || settings.imageScaleFactor};

    switch (component.conversionData.rescaleMethod) {
        case 'proportional': _.forEach(component.components, child => rescaleProportionally(child, scaleFactor)); break;
        case 'background': _.forEach(component.components, child => rescaleLayout(child, scaleFactor)); break;
        default: reorganizeChildren(component, component, width, nextSettings); break;
    }

    rescaleComponentHeight(component, {scaleFactor});
}

export {rescaleComponent, reorganizeChildren, rescaleComponentHeight};
