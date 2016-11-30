define(['lodash',
        'utils',
        'fake!previewExtensionsCore',
        'definition!componentsPreviewLayer/previewExtensions/tpaCompsExtension'],
    function (_, utils, previewExtensionsCore, tpaCompsExtensionDef) {
        'use strict';
        describe('tpa component preview extension', function(){
            var extension;
            var previewExtensionsRegistrar = previewExtensionsCore.registrar;
            beforeEach(function () {
                spyOn(previewExtensionsRegistrar, 'registerCompExtension').and.callFake(function (compType, ext) {
                    extension = ext;
                });

                tpaCompsExtensionDef(_, previewExtensionsCore, utils);
            });

            describe('resize function', function () {
                var mockNewProps, mockComp = {};

                beforeEach(function(){
                    mockComp.setState = jasmine.createSpy();
                });

                it('should reset height state', function(){
                    mockNewProps = {
                        style: {
                            height: 300,
                            width: 500
                        }
                    };

                    mockComp.state = {
                        height: 300
                    };


                    extension.resize.call(mockComp, mockNewProps);
                    expect(mockComp.setState).toHaveBeenCalledWith({
                        height: undefined
                    });
                });

                it('should reset width state', function(){
                    mockNewProps = {
                        style: {
                            height: 300,
                            width: 500
                        }
                    };

                    mockComp.state = {
                        width: 500
                    };

                    extension.resize.call(mockComp, mockNewProps);
                    expect(mockComp.setState).toHaveBeenCalledWith({
                        width: undefined
                    });
                });

                it('should not reset both height and width', function() {
                    mockNewProps = {
                        style: {
                            height: 300,
                            width: 500
                        }
                    };

                    mockComp.state = {};

                    extension.resize.call(mockComp, mockNewProps);
                    expect(mockComp.setState).not.toHaveBeenCalled();
                });

                it('should reset both height and width', function() {
                    mockNewProps = {
                        style: {
                            height: 300,
                            width: 500
                        }
                    };

                    mockComp.state = {
                        height: 300,
                        width: 500
                    };

                    extension.resize.call(mockComp, mockNewProps);
                    expect(mockComp.setState).toHaveBeenCalledWith({
                        width: undefined,
                        height: undefined
                    });
                });
            });

            describe('isInMobileDevMode', function() {
                var mockComp = {};

                beforeEach(function() {
                    mockComp.getAppData = jasmine.createSpy().and.returnValue({
                        appDefinitionId: '123'
                    });
                });

                it('should return true', function() {
                    mockComp.isUnderMobileView = jasmine.createSpy().and.returnValue(true);
                    mockComp.getEditorUrl = jasmine.createSpy().and.returnValue('ww.wix.com?appDefinitionId=123');

                    var isInMobileDevMode = extension.isInMobileDevMode.call(mockComp);

                    expect(isInMobileDevMode).toBeTruthy();
                });

                it('should return false because query param does not exist', function () {
                    mockComp.isUnderMobileView = jasmine.createSpy().and.returnValue(true);
                    mockComp.getEditorUrl = jasmine.createSpy().and.returnValue('ww.wix.com');

                    var isInMobileDevMode = extension.isInMobileDevMode.call(mockComp);

                    expect(isInMobileDevMode).toBeFalsy();
                });

                it('should return false because comp is not in mobile mode', function () {
                    mockComp.isUnderMobileView = jasmine.createSpy().and.returnValue(false);
                    mockComp.getEditorUrl = jasmine.createSpy().and.returnValue('ww.wix.com?appDefinitionId=123');

                    var isInMobileDevMode = extension.isInMobileDevMode.call(mockComp);

                    expect(isInMobileDevMode).toBeFalsy();
                });

                it('should return false because comp is not in dev mode', function () {
                    mockComp.isUnderMobileView = jasmine.createSpy().and.returnValue(true);
                    mockComp.getEditorUrl = jasmine.createSpy().and.returnValue('ww.wix.com?appDefinitionId=234');

                    var isInMobileDevMode = extension.isInMobileDevMode.call(mockComp);

                    expect(isInMobileDevMode).toBeFalsy();
                });
            });
        });
    });
