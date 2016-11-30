define([
    'santaProps/propsBuilder/componentPropsBuilder',
    'santaProps/propsBuilder/propsBuilderUtil',
    'santaProps/types/SantaTypes',
    'santaProps/utils/santaTypesUtils',
    'santaProps/utils/propsSelectorsFactory'
], function (componentPropsBuilder, propsBuilderUtil, SantaTypes, santaTypesUtils, propsSelectorsFactory) {
    'use strict';

    return {
        componentPropsBuilder: componentPropsBuilder,
        propsBuilderUtil: propsBuilderUtil,
        santaTypesUtils: santaTypesUtils,
        propsSelectorsFactory: propsSelectorsFactory,
        Types: SantaTypes
    };
});
