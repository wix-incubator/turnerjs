define([
    'lodash',
    'testUtils'
], function (_, testUtils) {
    'use strict';

    testUtils.describeWithMocks('isComponentVisible', {}, [
        'documentServices/component/component',
        'documentServices/constants/constants',
        'documentServices/structure/structure',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/documentMode/documentMode',
        'componentsPreviewLayer/componentsPreviewLayer'
    ], function (component, constants, structure, privateServicesHelper, documentMode) {
        describe('when componentsPreviewLayer is loaded', function () {
            var testItems = [
                {
                    choice: [false, false, false, false, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, false, false, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, false, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, false, false, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, false, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, false, false, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, false, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, false, false, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, true, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, false, true, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, true, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, false, true, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, true, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, false, true, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, false, true, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, false, true, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, false, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, true, false, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [false, false, true, false, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, true, false, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [false, false, true, false, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, true, false, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, false, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, true, false, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, true, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, true, true, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, true, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, true, true, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, true, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, false, true, true, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, false, true, true, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, false, true, true, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, false, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, false, false, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, false, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, false, false, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, false, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, false, false, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, false, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, false, false, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, true, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, false, true, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, true, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, false, true, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, true, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, false, true, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, false, true, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, false, true, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, false, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, true, false, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [false, true, true, false, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, true, false, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [false, true, true, false, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, true, false, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, false, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, true, false, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, true, false, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, true, true, false, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, true, false, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, true, true, false, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, true, true, false, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [false, true, true, true, true, false, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [false, true, true, true, true, true, false],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [false, true, true, true, true, true, true],
                    text: 'isFixed: false, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, false, false, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, false, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, false, false, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, false, false, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, false, false, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, false, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, false, false, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, false, true, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, false, true, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, true, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, false, true, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, true, false, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, false, true, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, true, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, false, true, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, false, true, true, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, true, false, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, false, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, true, false, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, false, false, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, true, false, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, false, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, true, false, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, false, true, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, true, true, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, true, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, true, true, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, true, false, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, false, true, true, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, true, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, false, true, true, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, false, true, true, true, true, true],
                    text: 'isFixed: true (controller can\'t be fixed), shouldShowFixedComp: false, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, false, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, false, false, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, false, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, false, false, false, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, false, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, false, false, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, false, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, false, false, true, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, true, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, false, true, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, true, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, false, true, false, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, true, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, false, true, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, false, true, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, false, true, true, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: false, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, false, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, true, false, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, true, true, false, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, true, false, false, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: false
                },
                {
                    choice: [true, true, true, false, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, true, false, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, false, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, true, false, true, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: false, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, true, false, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, true, true, false, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, true, false, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, true, true, false, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: false, isController: true, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, true, true, false, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: false',
                    result: true
                },
                {
                    choice: [true, true, true, true, true, false, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: false, shouldShowControllers: true',
                    result: true
                },
                {
                    choice: [true, true, true, true, true, true, false],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: false',
                    result: false
                },
                {
                    choice: [true, true, true, true, true, true, true],
                    text: 'isFixed: true, shouldShowFixedComp: true, isHidden: true, shouldShowHiddenComp: true, shouldIgnoreHiddenProp: true, isController: true, shouldShowControllers: true',
                    result: true
                }
            ];

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.siteData.addMeasureMap();
                this.pageId = this.siteData.getCurrentUrlPageId();

                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, this.pageId);
                var comp = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.siteData, this.pageId);

                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                this.pagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                this.controllerRef = this.ps.pointers.components.getComponent(controller.id, this.pagePointer);
                this.compRef = this.ps.pointers.components.getComponent(comp.id, this.pagePointer);
            });

            _.forEach(testItems, function (testItem) {
                it('should return ' + testItem.result + ' when ' + testItem.text, function () {
                    var isFixedPosition = testItem.choice[0];
                    var allowShowingFixedComponents = testItem.choice[1];
                    var isHidden = testItem.choice[2];
                    var showHiddenComponents = testItem.choice[3];
                    var shouldIgnoreHiddenProp = testItem.choice[4];
                    var isController = testItem.choice[5];
                    var showControllers = testItem.choice[6];

                    documentMode.allowShowingFixedComponents(this.ps, allowShowingFixedComponents);
                    documentMode.showHiddenComponents(this.ps, showHiddenComponents);
                    documentMode.showControllers(this.ps, showControllers);
                    var compRef = isController ? this.controllerRef : this.compRef;
                    if (isFixedPosition) {
                        structure.updateFixedPosition(this.ps, compRef, true);
                    }
                    if (isHidden) {
                        component.properties.update(this.ps, compRef, {isHidden: true});
                    }
                    if (shouldIgnoreHiddenProp) {
                        documentMode.ignoreComponentsHiddenProperty(this.ps, [compRef.id]);
                    }

                    expect(component.isComponentVisible(this.ps, compRef)).toBe(testItem.result);
                });
            });

            describe('Header & Footer', function () {
                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    this.siteData.addMeasureMap();
                    this.pageId = this.siteData.getCurrentUrlPageId();

                    this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.siteData);
                    this.pagePointer = this.ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                });

                _.forEach(['Header', 'Footer'], function (compName) {
                    it('should NOT hide fixed ' + compName + ' when allowShowingFixedComponents is false', function () {
                        var allowShowingFixedComponents = false;
                        var compFullName = 'wysiwyg.viewer.components.' + compName + 'Container';
                        var comp = testUtils.mockFactory.mockComponent(compFullName, this.siteData, this.pageId, undefined, undefined, 'SITE_HEADER', {layout: {fixedPosition: true}});
                        this.compRef = this.ps.pointers.components.getComponent(comp.id, this.pagePointer);

                        documentMode.allowShowingFixedComponents(this.ps, allowShowingFixedComponents);

                        expect(component.isComponentVisible(this.ps, this.compRef)).toBe(true);
                    });
                });
            });
        });
    });
});
