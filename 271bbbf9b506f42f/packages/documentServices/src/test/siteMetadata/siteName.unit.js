define(['lodash', 'definition!documentServices/siteMetadata/siteName', 'fake!documentServices/siteMetadata/dataManipulation'], function (_, SiteNameModuleDef, fakeDataManipulation) {
    'use strict';

    function sanitizeSiteName(siteName) {
        return siteName.replace(/([^\s\w\d_\-])/g, '').replace(/\s+/g, '-').replace(/-+$/g, '').toLowerCase();
    }

    describe('siteMetadata name sub module', function() {
        beforeEach(function() {
            this.siteNameModule = new SiteNameModuleDef(_, fakeDataManipulation);
        });

        describe('set and validate method', function() {
            it('set valid site name', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = 'fd4- 44-LW';
                var validationResult = this.siteNameModule.validate(null, siteName);
                this.siteNameModule.set(null, siteName);

                expect(validationResult).toEqual({success: true, extraInfo: 'fd4--44-lw'});
                expect(fakeDataManipulation.setProperty).toHaveBeenCalledWith(null, fakeDataManipulation.PROPERTY_NAMES.SITE_NAME, sanitizeSiteName(siteName));
            });

            it('setting a too long site name should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = new Array(22).join('a');
                var validationResult = this.siteNameModule.validate(null, siteName);

                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_TOO_LONG});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_TOO_LONG);
            });

            it('setting a too short site name should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = 'abc';
                var validationResult = this.siteNameModule.validate(null, siteName);
                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_TOO_SHORT});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_TOO_SHORT);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();

                siteName = '           ';
                validationResult = this.siteNameModule.validate(null, siteName);
                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_TOO_SHORT});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_TOO_SHORT);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('setting an empty string site name should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = '';
                var validationResult = this.siteNameModule.validate(null, siteName);

                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_IS_EMPTY});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_IS_EMPTY);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('setting a non-string site name should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteNames = [null, {}, {example: true, hello: 2}, [], [3, 4, 5]];

                _.forEach(siteNames, function(siteName) {
                    var validationResult = this.siteNameModule.validate(null, siteName);
                    expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_IS_NOT_STRING});
                    expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_IS_NOT_STRING);
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('setting a site name with invalid chars should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteNames = ['%sdf', '#ghnghn', '_fgegthgtr', '!!!DFg5445', '{df}', '|||354t35G', '...fr'];

                _.forEach(siteNames, function(siteName) {
                    var validationResult = this.siteNameModule.validate(null, siteName);
                    expect(validationResult).toEqual(jasmine.objectContaining({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_INVALID_CHARS}));
                    expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_INVALID_CHARS);
                }, this);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('setting a string that ends with a hyphen as site name should throw error', function() {
                spyOn(this.siteNameModule, 'getUsedSiteNames').and.returnValue([]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = 'rwgre88J-';
                var validationResult = this.siteNameModule.validate(null, siteName);

                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_ENDS_WITH_HYPHEN});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_ENDS_WITH_HYPHEN);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });

            it('setting a name that already exists as site name should throw error', function() {
                spyOn(fakeDataManipulation, 'getProperty').and.returnValue([sanitizeSiteName('example')]);
                spyOn(fakeDataManipulation, 'setProperty').and.stub();

                var siteName = 'example';
                var validationResult = this.siteNameModule.validate(null, siteName);

                expect(validationResult).toEqual({success: false, errorCode: this.siteNameModule.ERRORS.SITE_NAME_ALREADY_EXISTS});
                expect(this.siteNameModule.set.bind(this.siteNameModule, null, siteName)).toThrowError(this.siteNameModule.ERRORS.SITE_NAME_ALREADY_EXISTS);
                expect(fakeDataManipulation.setProperty).not.toHaveBeenCalled();
            });
        });

        it('getSiteName method', function() {
            spyOn(fakeDataManipulation, 'getProperty').and.returnValue('exampleName');

            var result = this.siteNameModule.get(null);

            expect(result).toEqual('exampleName');
        });

        it('getUsedSiteNames', function() {
            var usedNames = ['exampleName1', 'exampleName2', 'exampleName3'];
            spyOn(fakeDataManipulation, 'getProperty').and.returnValue(usedNames);

            var result = this.siteNameModule.getUsedSiteNames(null);

            expect(result).toEqual(usedNames);
        });

        it('markSiteNameAsUsed', function(){
            var usedNames = ['exampleName1', 'exampleName2', 'exampleName3'];
            spyOn(fakeDataManipulation, 'getProperty').and.returnValue(usedNames);
            spyOn(fakeDataManipulation, 'setProperty').and.callFake(function(ps, propertyName, newUsedNames){
                usedNames = newUsedNames;
            });

            var newSiteName = 'newSiteName';
            this.siteNameModule.markSiteNameAsUsed(null, newSiteName);
            expect(usedNames).toEqual(['exampleName1', 'exampleName2', 'exampleName3', newSiteName]);
        });
    });
});
