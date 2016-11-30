define(['wixappsCore/proxies/mediaLabelProxy'], function (mediaLabelProxy) {

    'use strict';


    describe('mediaLabelProxy', function () {

        describe('.shouldComponentUpdate', function () {

            it('should call this.isViewDefCompChangedInNextProps if data path is not changed', function () {
                var context = stubContextWithUnchangedDataPath();
                context.isViewDefCompChangedInNextProps = jasmine.createSpy('isViewDefCompChangedInNextProps');
                callShouldComponentUpdate(context);
                expect(context.isViewDefCompChangedInNextProps).toHaveBeenCalled();
            });


            describe('return value', function () {

                it('should be true if data path is not changed and this.isViewDefCompChangedInNextProps returns true', function () {
                    var context = stubContextWithUnchangedDataPath();
                    context.isViewDefCompChangedInNextProps = function () { return true; };
                    var shouldComponentUpdate = callShouldComponentUpdate(context);
                    expect(shouldComponentUpdate).toBe(true);
                });


                it('should be false if data path is not changed and this.isViewDefCompChangedInNextProps returns false', function () {
                    var context = stubContextWithUnchangedDataPath();
                    context.isViewDefCompChangedInNextProps = function () { return false; };
                    var shouldComponentUpdate = callShouldComponentUpdate(context);
                    expect(shouldComponentUpdate).toBe(false);
                });

            });


            it('should not throw if data path is not changed and this.isViewDefCompChangedInNextProps is undefined', function () {
                var context = stubContextWithUnchangedDataPath();
                expect(function () {
                    callShouldComponentUpdate(context);
                }).not.toThrow();
            });


            function stubContextWithUnchangedDataPath() {
                return {props: {viewProps: {siteData: {}, getNormalizedDataPath: function () {}}}};
            }


            function stubNextProps() {
                return {viewDef: {}};
            }


            function callShouldComponentUpdate(context, optionalNextProps) {
                var nextProps = optionalNextProps ? optionalNextProps : stubNextProps();
                return mediaLabelProxy.shouldComponentUpdate.call(context, nextProps);
            }

        });

    });
});
