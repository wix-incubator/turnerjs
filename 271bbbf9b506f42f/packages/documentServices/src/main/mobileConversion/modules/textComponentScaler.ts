'use strict';

import * as _ from 'lodash';
import * as fontSizeDefinitions from 'documentServices/mobileConversion/modules/fontSizeDefinitions';
import {mobileUtils} from 'siteUtils';

function clamp(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min);
}

function convertByPresetTable(fontSize: number, characterCount: number){
    var table = fontSizeDefinitions.fontSizeCharacterCountMap;
    var fsRange = fontSizeDefinitions.fontSizeRange;
    var ccRange = fontSizeDefinitions.characterCountRange;
    var fsAdjusted = Math.round(clamp(fontSize, fsRange.min, fsRange.max)) - fsRange.min;
    var ccAdjusted = Math.round(clamp(characterCount, ccRange.min, ccRange.max)) - ccRange.min;
    return table[fsAdjusted][ccAdjusted];
}


function setSingleScale(comp: ComponentWithConversionData){
    var avgFontSize = comp.conversionData.averageNormalizedFontSize;
    var characterCount = comp.conversionData.textLength;
    var newSize = convertByPresetTable(avgFontSize, characterCount);
    var sizeAfterLegacyImplicitConversionInViewer = mobileUtils.convertFontSizeToMobile(avgFontSize, 1);
    comp.layout.scale = newSize / sizeAfterLegacyImplicitConversionInViewer;
}

function getAllTextComponents(comp: ComponentWithConversionData): ComponentWithConversionData[] {
    if (comp.components && comp.components.length > 0){
        return <ComponentWithConversionData[]> _(comp.components)
            .map(getAllTextComponents)
            .flatten()
            .compact()
            .value();
    }

    if (comp.componentType === "wysiwyg.viewer.components.WRichText"){
        return [comp];
    }

    return <ComponentWithConversionData[]> [];
}

function setScale(comps: ComponentWithConversionData[]): void {
    _(comps)
        .map(getAllTextComponents)
        .flatten()
        .compact()
        .forEach(setSingleScale)
        .commit();
}

export {
    setScale
}
