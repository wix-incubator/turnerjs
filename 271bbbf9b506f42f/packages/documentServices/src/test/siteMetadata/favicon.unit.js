define(['lodash', 'definition!documentServices/siteMetadata/favicon', 'fake!documentServices/siteMetadata/dataManipulation'], function (_, FaviconDef, fakeDataManipulation) {
    'use strict';

    describe('siteMetadata favicon sub module', function() {
        beforeEach(function() {
            fakeDataManipulation.PROPERTY_NAMES = {
                FAVICON: 'favicon_path'
            };
            this.favicon = new FaviconDef(_, fakeDataManipulation);
        });
        describe('set method', function() {
            beforeEach(function() {
                spyOn(fakeDataManipulation, 'setProperty').and.stub();
            });

            it('set favicon with legal argument', function() {
                this.favicon.set(null, 'exampleUri');
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.FAVICON, 'exampleUri');

                this.favicon.set(null, '');
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.FAVICON, '');
            });

            it('setting a non-string favicon should throw an error', function() {
                var siteNames = [null, {}, {example: true, hello: 6}, [], [1, 2, 3], 4];
                _.forEach(siteNames, function(siteName) {
                    expect(this.favicon.set.bind(this.favicon, null, siteName)).toThrowError(this.favicon.ERRORS.FAVICON_IS_NOT_STRING);
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });
        });

        describe('get method', function() {
            beforeEach(function() {
                spyOn(fakeDataManipulation, 'getProperty').and.stub();
            });

            it('get should return the favicon path', function() {
                this.favicon.get(null);
                expect(fakeDataManipulation.getProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.FAVICON);
            });
        });
    });
});