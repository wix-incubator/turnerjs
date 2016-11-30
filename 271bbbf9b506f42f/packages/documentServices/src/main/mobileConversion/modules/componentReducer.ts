import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {dockUtils} from 'utils';
import * as theme from 'documentServices/theme/theme';
import * as _ from 'lodash';
import * as componentsMetaData from 'documentServices/componentsMetaData/componentsMetaData';
import * as dataModel from 'documentServices/dataModel/dataModel';
import * as fontSizeConverter from 'documentServices/mobileConversion/modules/fontSizeConverter'

function getStyle(ps: ps, comp: Component) {
    const styleId = comp.styleId;
    if (styleId) {
        return theme.styles.get(ps, styleId);
    }
    return null;
}

function getBackground(ps: ps, comp: Component, pageId: string) {
    return _.get(comp.designQuery && dataModel.getDesignItemById(ps, comp.designQuery.replace('#', ''), pageId), 'background');
}

function getBackgroundColor(ps: ps, comp: Component, pageId: string) {
    const backgroundColor = (comp.designQuery) ?
        _.get(getBackground(ps, comp, pageId), 'color', null) :
        _.get(getStyle(ps, comp), ['style', 'properties', 'bg'], null);

    return backgroundColor ? backgroundColor.replace(/[{}]/g,'') : null;
}

function hasMediaBackground(ps: ps, component: Component, pageId: string) : boolean {
    return  _.has(getBackground(ps, component, pageId), 'mediaRef');
}

function isSolidColorBackgroundComponent(ps: ps, component: ComponentWithConversionData, pageId: string): boolean {
    if (_.get(component, ['conversionData', 'category']) === 'columns') {
        return _.size(component.components) === 1 && !hasMediaBackground(ps, component.components[0], pageId);
    }

    return component.componentType === 'wysiwyg.viewer.components.StripContainer' && !hasMediaBackground(ps, component, pageId);
}

function getComponentBorderFromStyle(ps: ps, component: Component): number {
    var border = '' + _.get(getStyle(ps, component), ['style', 'properties', 'brw'], '0');
    return +(border.match(/\d/g).join(''));
}

function getContainerOpacity(ps: ps, component: ComponentWithConversionData, pageId: string, isSolidColorBackground: boolean): number {
    if (isSolidColorBackground || _.get(component, ['conversionData', 'category']) === 'column') {
        return +_.get(getBackground(ps, component, pageId), 'colorOpacity', 1);
    }

    if (component.componentType !== 'mobile.core.components.Container') {
        return 1;
    }

    const style = getStyle(ps, component);
    const styleSkin = _.get(style, 'skin');
    if (styleSkin !== 'wysiwyg.viewer.skins.area.RectangleArea' && styleSkin !== 'wysiwyg.viewer.skins.area.DefaultAreaSkin') {
        return 1;
    }
    return +_.get(style, ['style', 'properties', 'alpha-bg'], 1);
}

interface TextStats {
    totalChars: number;
    accumulatedFontSize: number;
    accumulatedNormalizedFontSize: number;
    alignments: string[];
}

function createTextFragment(strHTML: string): HTMLElement {
    var e = window.document.createElement('DIV');
    e.innerHTML = strHTML;
    return e;
}

interface FontData {
    fontSize?: number,
    fontName?: string
}

function getFontData(ps: ps, className: string): FontData {
    if (!className) {
        return;
    }

    const fontString = theme.fonts.get(ps, className);
    const execResult = /^\w+\s\w+\s\w+\s(-?\d+(?:\.\d+)?)px\/[\w\-.]*\s("[^"]*"|[\w#$%&'()*+,.:;?@^_`~-]*)\s(?:{\w*}|#\w{6})$/.exec(fontString);
    return _.pick({
        fontSize: _.get(execResult, 1),
        fontName: _.get(execResult, 2)
    }, _.identity);
}

function getTextStats(ps: ps, node: Node, fontData: FontData = {fontSize: 0, fontName: ""}, alignment = 'left'): TextStats {
    if (!node) {
        return {totalChars: 0, accumulatedFontSize: 0, accumulatedNormalizedFontSize: 0, alignments: []};
    }

    if (node.nodeType === node.TEXT_NODE) {
        const totalChars = node.textContent.trim().length;
        return {
            totalChars: totalChars,
            accumulatedFontSize: totalChars * fontData.fontSize,
            accumulatedNormalizedFontSize: totalChars * fontSizeConverter.convertSize(fontData.fontName, fontData.fontSize),
            alignments: totalChars > 0 ? [alignment] : []
        };
    }

    if (!_.size(node.childNodes)) {
        return {totalChars: 0, accumulatedFontSize: 0, accumulatedNormalizedFontSize: 0, alignments: []};
    }

    if (node.nodeType === node.ELEMENT_NODE) {
        const element = <Element>node;
        _.assign(fontData, getFontData(ps, element.getAttribute('class')));

        const style = element.getAttribute('style');
        if (_.size(style)) {
            const fontSizeAttribute = style.match(/font-size:\s?(\d+(\.\d+)?)px/);
            const alignAttribute = style.match(/text-align:\s?(left|right|center)/);
            fontData.fontSize = +_.get(fontSizeAttribute, 1, fontData.fontSize);
            alignment = _.get(alignAttribute, 1, alignment);
        }
    }

    return _.reduce<Node, TextStats>(node.childNodes, (result, childNode) => {
        const stats = getTextStats(ps, childNode, _.clone(fontData), alignment);
        return {
            alignments: result.alignments.concat(stats.alignments),
            totalChars: result.totalChars + stats.totalChars,
            accumulatedFontSize: result.accumulatedFontSize + stats.accumulatedFontSize,
            accumulatedNormalizedFontSize: result.accumulatedNormalizedFontSize + stats.accumulatedNormalizedFontSize
        };
    }, {totalChars: 0, accumulatedFontSize: 0, accumulatedNormalizedFontSize: 0, alignments: []});
}


function computeActualTextWidth(fragment) {
    fragment.setAttribute('style', 'opacity: 0; max-width: none !important; white-space: nowrap; position: absolute');
    window.document.body.appendChild(fragment);
    const width = fragment.clientWidth;
    window.document.body.removeChild(fragment);
    return width;
}

function reduceTextData(ps: ps, component: Component, pageId: string) {
    const text = component.dataQuery ? _.get(dataModel.getDataItemById(ps, component.dataQuery.replace('#', ''), pageId), 'text', '') : '';
    const fragment = createTextFragment(text);
    const stats = getTextStats(ps, fragment);
    const averageFontSize = stats.accumulatedFontSize / stats.totalChars;
    const averageNormalizedFontSize = stats.accumulatedNormalizedFontSize / stats.totalChars;
    const textAlignments = _.uniq(stats.alignments);

    return {
        textLength: stats.totalChars,
        actualTextWidth: computeActualTextWidth(fragment),
        textAlignments,
        averageFontSize,
        averageNormalizedFontSize
    };
}

function removeConversionData(comp : ComponentWithConversionData): void {
    if (_.has(comp, 'conversionData')) {
        delete comp.conversionData;
    }

    if (_.has(comp, ['layout', 'docked'])) {
        delete comp.layout.docked;
    }
}

function setConversionData(comp: Component, overriddenValues): void {
    const oldConversionData = _.get(comp, 'conversionData', {});
    const newConversionData = _.assign(oldConversionData, overriddenValues);
    _.assign(comp, {conversionData: _.omit(newConversionData, _.isNull)});
}

function createConversionData(ps: ps, component: Component, pageId: string): void {
    const mobileConversionConfig = componentsMetaData.public.getMobileConversionConfig(ps, component, pageId);
    const compWithConversionConfig = <ComponentWithConversionData> _.assign({}, _.clone(component), {conversionData: mobileConversionConfig});
    const conversionData = <ConversionData> {};

    const borderWidth = getComponentBorderFromStyle(ps, component);
    conversionData.borderWidth = borderWidth || null;

    conversionData.isSolidColorBackground = isSolidColorBackgroundComponent(ps, compWithConversionConfig, pageId) || null;
    const containerOpacity = getContainerOpacity(ps, compWithConversionConfig, pageId, conversionData.isSolidColorBackground);
    conversionData.isSemiTransparentContainer = containerOpacity < 1;
    conversionData.isTransparentContainer = borderWidth ? false : containerOpacity === 0;
    conversionData.backgroundColor = getBackgroundColor(ps, component, pageId);

    const dockedRuntimeLayouts = ps.dal.get(ps.pointers.general.getDockedRuntimeLayout());
    if (_.has(component, ['layout', 'docked']) && dockedRuntimeLayouts[component.id]) {
        _.assign(component.layout.docked, dockedRuntimeLayouts[component.id]);
    }

    conversionData.isScreenWidth = conversionData.isScreenWidth || dockUtils.isHorizontalDockToScreen(component.layout) || dockUtils.isFullPageComponent(component.layout) || null;

    const isTextComponent = conversionUtils.isTextComponent(compWithConversionConfig);
    _.assign(conversionData, isTextComponent ? reduceTextData(ps, component, pageId) : {}, mobileConversionConfig);
    setConversionData(component, conversionData);

    if (component.layout) {
        delete component.layout.anchors;
    }
}

export {
    createConversionData,
    removeConversionData
}
