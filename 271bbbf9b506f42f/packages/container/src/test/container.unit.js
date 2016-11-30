define([
    'lodash',
    'testUtils',
    'react',
    'container'],
    function (_, testUtils, React, container) {
    'use strict';

    function createProps(compClass, partialProps) {
        return testUtils.santaTypesBuilder.getComponentProps(compClass, _.merge({
            // Default values here
        }, partialProps));
    }

    function getContainer(partialProps) {
        var props = createProps(container, partialProps);
        return testUtils.getComponentFromDefinition(container, props);
    }

    describe("containers", function () {
        describe("Container", function () {
            it("should render with only inlineContent", function () {
                var comp = getContainer(),
                    skinProperties = comp.getSkinProperties();

                expect(skinProperties.inlineContent).toBeDefined();
            });

            it("should render with child component", function () {
                var childCompId = 'SPIDER PIG',
                    childCompClass = React.createClass({render: function() { return null; }}),
                    childComp = React.createElement(childCompClass, {id: childCompId}),
                    containerComp = getContainer({
                        children: [childComp]
                    }),
                    skinProperties = containerComp.getSkinProperties(),
                    inlineContentChildren = skinProperties.inlineContent.children;

                expect(React.addons.TestUtils.isElementOfType(inlineContentChildren[0], childCompClass)).toBe(true);
                expect(inlineContentChildren[0].props.id).toEqual(childCompId);
            });

            it("should render with multiple children", function () {
                var childComp1Id = 'Spider Pig! Spider Pig!',
                    childComp2Id = 'Does whatever a spider pig does!',
                    childCompClass = React.createClass({render: function() { return null; }}),
                    childComp1 = React.createElement(childCompClass, {id: childComp1Id}),
                    childComp2 = React.createElement(childCompClass, {id: childComp2Id}),
                    containerComp = getContainer({
                        children: [childComp1, childComp2]
                    }),
                    skinProperties = containerComp.getSkinProperties(),
                    inlineContentChildren = skinProperties.inlineContent.children;

                expect(inlineContentChildren[0].props.id).toEqual(childComp1Id);
                expect(inlineContentChildren[1].props.id).toEqual(childComp2Id);
            });
        });

    });
});
