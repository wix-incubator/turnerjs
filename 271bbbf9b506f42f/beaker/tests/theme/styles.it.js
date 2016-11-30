define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils'], function (_, santa, errorUtils, apiCoverageUtils) {
    'use strict';

    describe('Document Services -Theme - Styles', function () {
        
        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing theme styles spec');
                done();
            });
        });

        describe('Get', function(){

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.styles.get');
            });

            it('should not be able to get non-existing style', function () {
                var nonExistingStyle = documentServices.theme.styles.get('nonExistingStyle');
                expect(nonExistingStyle).toBeUndefined();
            });

            it('should successfully get existing style.', function () {
                var photoStyle1 = documentServices.theme.styles.get('wp1');
                expect(photoStyle1).toBeDefined();
                expect(photoStyle1.id).toBe('wp1');
            });

            it('should get different styles when gets styles with different names', function () {
                var photoStyle1 = documentServices.theme.styles.get('wp1');
                var photoStyle2 = documentServices.theme.styles.get('wp2');
                expect(photoStyle2).toBeDefined();
                expect(photoStyle1).not.toEqual(photoStyle2);
            });
        });

        describe('Update', function(){

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.theme.styles.update');
            });

            it('should be able to update the styles in the theme of the document', function (done) {
                var wp1 = documentServices.theme.styles.get('wp1');
                var updatedStyle = _.cloneDeep(wp1);
                updatedStyle.style.properties.brd = 'color_18';
                updatedStyle.style.properties.brw = '7px';

                documentServices.theme.styles.update('wp1', updatedStyle);

                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.theme.styles.get('wp1')).toEqual(updatedStyle);
                    expect(documentServices.theme.styles.get('wp1')).not.toEqual(wp1);
                    done();
                });
            });

            it('should omit the update of styleType of a style', function (done) {
                var wp1 = documentServices.theme.styles.get('wp1');
                var updatedStyle = _.cloneDeep(wp1);
                updatedStyle.styleType = 'myCustomStyle';
                documentServices.theme.styles.update('wp1', updatedStyle);
                documentServices.waitForChangesApplied(function () {
                    expect(documentServices.theme.styles.get('wp1')).not.toEqual(updatedStyle);
                    expect(documentServices.theme.styles.get('wp1')).toEqual(wp1);
                    done();
                });
            });

            it('should not be able to update a style with null instead of name', function (done) {
                errorUtils.waitForError(documentServices, done, 'missing arguments - styleId: null, styleValue: undefined');
                documentServices.theme.styles.update(null);
            });

            it('should not be able to update a style without a name non exisiting', function (done) {
                errorUtils.waitForError(documentServices, done, 'missing arguments - styleId: [object Object], styleValue: undefined');

                var style = documentServices.theme.styles.get('wp1');
                documentServices.theme.styles.update(style);
            });

            it('should not be able to update a style without a name', function (done) {
                errorUtils.waitForError(documentServices, done, 'missing arguments - styleId: myStyle, styleValue: null');
                documentServices.theme.styles.update('myStyle', null);
            });

            it('should not be able to set an invalid style', function (done) {
                errorUtils.waitForError(documentServices, function () {
                    var style = documentServices.theme.styles.get('myStyle');
                    expect(style).toBeUndefined();
                    done();
                }, 'received style did not contain a skin property');

                documentServices.theme.styles.update('myStyle', {});
            });
        });
    });
});
