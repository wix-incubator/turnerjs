define(['coreUtils/core/reactComponentUtils'], function(reactComponentUtils){
    'use strict';

    describe('reactComponentUtils', function(){
        var component;

        it('should recursively get ref from the component', function(){
            component = {refs: {firstRef: 'testComponent'}};
            expect(reactComponentUtils.getRef(component, 'firstRef')).toBe('testComponent');

            component = {refs: {firstRef: 'otherComponent'}};
            expect(reactComponentUtils.getRef(component, 'firstRef')).toBe('otherComponent');

            component = {
                refs: {
                    firstRef: {
                        refs: {secondRef: 'secondComponent'}
                    }
                }
            };
            expect(reactComponentUtils.getRef(component, 'firstRef', 'secondRef')).toBe('secondComponent');

            component = {
                refs: {
                    firstRef: {
                        refs: {
                            secondRef: {
                                refs: {
                                    thirdRef: 'thirdComponent'
                                }
                            }
                        }
                    }
                }
            };
            expect(reactComponentUtils.getRef(component, 'firstRef', 'secondRef', 'thirdRef')).toBe('thirdComponent');

            component = {};
            expect(reactComponentUtils.getRef(component, 'firstRef')).toBe(undefined);

            component = {refs: {}};
            expect(reactComponentUtils.getRef(component, 'firstRef', 'secondRef')).toBe(undefined);
        });
    });
});
