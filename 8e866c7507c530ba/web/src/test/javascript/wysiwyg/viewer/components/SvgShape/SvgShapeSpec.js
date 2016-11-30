describe("SvgShape", function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.svgshape.SvgShape')
        .resources('W.Data', 'W.ComponentLifecycle', 'W.Utils', 'W.Config');

    beforeEach(function () {
        var componentLogicName = 'SvgShapeLogic',
            capitalize = function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
            };

        this.createMockSkin = function (svgShapeElement) {
            var skinName = 'internal.skins.Svg' + capitalize(svgShapeElement.nodeName) + 'ShapeMockSkin';
            if (!(svgShapeElement instanceof Element)) {
                throw new Error('Invalid shape element parameter passed. Expected dom element');
            }

            this.define.skin(skinName, function (def) {
                var svgElement = document.createElement('svg');
                var gElement = document.createElement('g');

                svgElement.setAttribute('version', '1.1');
                svgElement.setAttribute('xmlns', 'http://www.23.org/2000/svg');
                gElement.appendChild(svgShapeElement);
                svgElement.appendChild(gElement);

                def.inherits('core.managers.skin.BaseSkin2');
                def.html(svgElement.outerHTML);
            });

            return skinName;
        };

        this.createComponentInstance = function (svgShapeElement) {
            var builder = new this.ComponentBuilder(document.createElement('div')),
                mockSkinName = this.createMockSkin(svgShapeElement);

            builder
                .withType('wysiwyg.viewer.components.svgshape.SvgShape')
                .withSkin(mockSkinName)
                ._with("htmlId", "mockId")
                .onWixified(function (createdComponent) {
                    this[componentLogicName] = createdComponent;
                }.bind(this))
                .create();

            waitsFor(function () {
                return this[componentLogicName];
            }, componentLogicName + ' to be ready', 1000);
        };

        this[componentLogicName] = null;
    });

    describe('shape skin acceptance test - create a shape component', function () {
        beforeEach(function () {
            this.createComponentInstance(document.createElement('rect'));
        });
        it('must have a single <SVG> tag in the components DOM', function () {
            expect(this.SvgShapeLogic.$view.getElementsByTagName('svg').length).toBe(1);
        });
        it('must have a single <G> tag in the components DOM', function () {
            expect(this.SvgShapeLogic.$view.getElementsByTagName('g').length).toBe(1);
        });
        it('the <G> tag must contain at least one of the following elements: <path>, <rect>, <circle>, <ellipse>, <line>, <polygon>, <polyline>', function () {
            var gElem = this.SvgShapeLogic.$view.getElementsByTagName('g')[0],
                elementsToFind = ['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'],
                count = 0;

            elementsToFind.forEach(function (tagName) {
                count += gElem.getElementsByTagName(tagName).length;
            });

            expect(count).toBeGreaterThan(0);
        });
    });

});
