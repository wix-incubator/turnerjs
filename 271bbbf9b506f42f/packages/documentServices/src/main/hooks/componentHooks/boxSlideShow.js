/**
 * Created by talm on 18/08/15.
 */
define(['lodash', 'core', 'documentServices/component/component', 'documentServices/layouters/layouters', 'documentServices/component/componentStylesAndSkinsAPI', 'documentServices/theme/theme'], function (_, core, component, layouters, componentStylesAndSkinsAPI, theme) {
    'use strict';

    var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;
    var STYLE_TO_OVERRIDE_FROM_BOX = ['rd', 'brd', 'brw', 'alpha-brd'];

    function createNewStyleWithChanges(ps, compRef, updatedProps) {
        var compCurrStyleId = componentStylesAndSkinsAPI.style.getId(ps, compRef);
        var compCurrStyleObj = theme.styles.get(ps, compCurrStyleId);
        var clonedStyleProperties = _.cloneDeep(compCurrStyleObj);
        clonedStyleProperties.styleType = 'custom';
        clonedStyleProperties.componentClassName = clonedStyleProperties.componentClassName || component.getType(ps, compRef);
        clonedStyleProperties = _.merge(clonedStyleProperties, updatedProps);
        return theme.styles.createItem(ps, clonedStyleProperties);
    }

    function updateSlidesStyle(privateServices, compPointer, oldBoxStyle, newBoxStyle) {
        var propsChanged = _.omit(newBoxStyle.style.properties, function (v, k) {
            return oldBoxStyle.style.properties[k] === v;
        });
        if (_(propsChanged).keys().intersection(STYLE_TO_OVERRIDE_FROM_BOX).isEmpty()) {
            return;
        }
        var boxSlides = layouters.getNonMasterChildren(privateServices, compPointer);
        var overrideProps = {style: {properties: {}}};
        _.forEach(STYLE_TO_OVERRIDE_FROM_BOX, function (propName) {
            overrideProps.style.properties[propName] = propsChanged[propName];
        });
        _.forEach(boxSlides, function (slide) {
            var updatedBoxSlideStyleId = createNewStyleWithChanges(privateServices, slide, overrideProps);
            var newStyleObj = theme.styles.get(privateServices, updatedBoxSlideStyleId);
            componentStylesAndSkinsAPI.style.update(privateServices, slide, newStyleObj);

        });
    }

    function verifySlideShowStructureOnAdd(ps, compToAddPointer, containerPointer, compDefinitionPrototype){
        var slides = boxSlideShowCommon.getSlidesFromChildrenByStructure(compDefinitionPrototype.components);
        var isAtLeastOneSlide = slides.length > 0;
        var isSlideWithNonMatchingType = _.find(slides, function(slide){
            return slide.componentType !== boxSlideShowCommon.getMatchingChildSlideType(compDefinitionPrototype.componentType);
        });

        if (!isAtLeastOneSlide || isSlideWithNonMatchingType){
            throw new Error('Invalid slideShow structure definition');
        }
    }

    function verifySlideShowStructureOnDelete(ps, deletedCompPointer, deletingParent){
        if (deletingParent) {
            return;
        }
        var slideShowParent = ps.pointers.components.getParent(deletedCompPointer);
        var childrenPointers = ps.pointers.components.getChildren(slideShowParent);
        var childrenTypes = _.map(childrenPointers, function(child){
            return {componentType: component.getType(ps, child)};
        });
        var slides = boxSlideShowCommon.getSlidesFromChildrenByStructure(childrenTypes);
        if (slides.length === 1){
            throw new Error("can't delete the last slide");
        }
    }

    return {
        updateSlidesStyle: updateSlidesStyle,
        verifySlideShowStructureOnAdd: verifySlideShowStructureOnAdd,
        verifySlideShowStructureOnDelete: verifySlideShowStructureOnDelete
    };
});
