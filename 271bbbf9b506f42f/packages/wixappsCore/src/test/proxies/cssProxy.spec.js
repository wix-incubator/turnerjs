define(['lodash', 'testUtils'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('cssProxy', function () {

        beforeEach(function () {
            this.items = [{
                value: 'child proxy1',
                comp: {
                    name: 'Label'
                }
            },
            {
                value: 'child proxy2',
                comp: {
                    name: 'Label'
                }
            }];

            this.viewDef = {
                comp: {
                    "name": "Css",
                    "items": this.items
                }
            };
        });

        it('Should create a css proxy - basically only a div container for proxy children', function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('Css', props);
            expect(proxy.refs.component).toBeComponentOfType('div');
            var proxyChildren = proxy.refs.component.children;
            expect(proxyChildren.length).toBe(this.items.length);
        });

        it("Should create children for each of it\'s items", function () {
            var props = testUtils.proxyPropsBuilder(this.viewDef);
            var proxy = testUtils.proxyBuilder('Css', props);
            spyOn(proxy, 'renderChildProxy').and.callThrough();
            proxy.forceUpdate();

            _.forEach(this.items, function(item, index){
                expect(proxy.renderChildProxy).toHaveBeenCalledWith(item, index);
            });
        });
    });
});
