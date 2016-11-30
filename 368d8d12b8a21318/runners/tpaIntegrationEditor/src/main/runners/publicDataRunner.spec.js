define(['lodash',
    'tpaIntegrationEditor/driver/driver', 'tpaIntegrationEditor/driver/driverDom', 'jasmine-boot'
], function (_, driver, driverDom) {
    'use strict';

    // http://editor.wix.com/html/editor/web/renderer/edit/a142f958-f15f-4cb7-86b8-4ab51b4d01e6?uaToken=gqQCeJyM2K7bRsGy1qfcPgg0zmyWwIcCF0MvbYatx0c2--2P8XuoDkjj6WWAUGMtWPkmOcUv44YWhk0PsiGqcD90vOpPPkYHxPVRlqjhO_tUGNAQOOrhm0QG9aURR2sOqtA_nx3qStdZ5CEmojvsmQ&metaSiteId=5ba8f51d-ca63-463e-b4c3-cbd3490b0649&editorSessionId=8F2597BE-548D-4F32-AE67-EA03382913CB&petri_ovr=specs.RenderSantaModelsInPreview:true;specs.RenderSantaInEditor:true;specs.DisableNewRelicScripts:true;&SantaVersions=http://localhost/target&SantaEditorVersions=http://localhost/editor-base/target&forceEditorVersion=new&debug=all
    describe('Public data handlers', function() {
        var compIdForCompData = 'comp-iesblg36';
        var compIdForAppData = 'comp-iese2ua3';

        var compKey = 'compKey';
        var compValue = 'compValue';
        var expectedCompTpaData = {};
        expectedCompTpaData[compKey] = compValue;

        var appKey = 'appKey';
        var appValue = 'appValue';
        var expectedAppTpaData = {};
        expectedAppTpaData[appKey] = appValue;


        describe('set value', function() {
            it('should set value in component scope', function(done) {
                var compData = driver.getCompData(compIdForCompData);
                expect(compData.tpaData).toBeUndefined();
                driver.setPublicDataValue(compIdForCompData, compKey, compValue, 'COMPONENT', function(data) {
                    expect(data).toEqual(expectedCompTpaData);
                    compData = driver.getCompData(compIdForCompData);
                    expect(compData.tpaData.content).toEqual(JSON.stringify(expectedCompTpaData));
                    done();
                });
            });

            it('should set value in app scope', function(done) {
                var compData = driver.getCompData(compIdForAppData);
                expect(compData.tpaData).toBeUndefined();
                driver.setPublicDataValue(compIdForAppData, appKey, appValue, 'APP', function(data) {
                    expect(data).toEqual(expectedAppTpaData);
                    compData = driver.getCompData(compIdForAppData);
                    expect(compData.tpaData).toBeUndefined();
                    done();
                });
            });

        });

        describe('get value', function() {
            it('should get value from component scope', function(done) {
                driver.getPublicDataValue(compIdForCompData, compKey, 'COMPONENT', function(data) {
                    expect(data).toEqual(expectedCompTpaData);
                    done();
                });
            });

            it('should get value from app scope', function(done) {
                driver.getPublicDataValue(compIdForCompData, appKey, 'APP', function(data) {
                    expect(data).toEqual(expectedAppTpaData);
                    done();
                });
            });

            it('should not get value from comp scope', function(done) {
                driver.getPublicDataValue(compIdForAppData, compKey, 'COMPONENT', function(data) {
                    expect(data.error.message).toEqual('key ' + compKey + ' not found in COMPONENT scope');
                    done();
                });
            });

            it('should not get value from app scope', function(done) {
                driver.getPublicDataValue(compIdForAppData, compKey, 'APP', function(data) {
                    expect(data.error.message).toEqual('key ' + compKey + ' not found in APP scope');
                    done();
                });
            });
        });

        describe('remove value', function() {
            it('should remove value from component scope', function(done) {
                var compData = driver.getCompData(compIdForCompData);
                var content = JSON.parse(compData.tpaData.content);
                expect(_.keys(content)).toContain(compKey);
                driver.removePublicDataValue(compIdForCompData, compKey, 'COMPONENT', function(data) {
                    expect(data).toEqual(expectedCompTpaData);
                    compData = driver.getCompData(compIdForCompData);
                    content = JSON.parse(compData.tpaData.content);
                    expect(_.keys(content)).not.toContain(compKey);
                    done();
                });
            });

            it('should remove value from app scope', function(done) {
                driver.removePublicDataValue(compIdForCompData, appKey, 'APP', function(data) {
                    expect(data).toEqual(expectedAppTpaData);
                    done();
                });
            });
        });

        describe('get values', function() {
            var values = { 1: 'val1',
                2: 'val2',
                3: 'val3' };

            it('should set values in component scope', function(done) {
                driver.setPublicDataValues(compIdForCompData, values, 'COMPONENT', function() {
                    var compData = driver.getCompData(compIdForCompData);
                    expect(compData.tpaData.content).toEqual(JSON.stringify(values));
                    done();
                });
            });

            it('should get values from component scope', function(done) {
                driver.getPublicDataValues(compIdForCompData, [1, 2, 3], 'COMPONENT', function(data) {
                    expect(data).toEqual(values);
                    done();
                });
            });

            var appValues = { 4: 'val1', 5: 'val2', 6: 'val3' };
            it('should set values from app scope', function(done) {
                driver.setPublicDataValues(compIdForAppData, appValues, 'APP', function() {
                    var compData = driver.getCompData(compIdForAppData);
                    expect(compData.tpaData).toBeUndefined();
                    done();
                });
            });

            it('should get values from app scope', function(done) {
                driver.getPublicDataValues(compIdForCompData, [4, 5, 6], 'APP', function(data) {
                    expect(data).toEqual(appValues);
                    done();
                });
            });
        });

        describe('preview mode', function() {
           it('should get the data when in modal', function(done) {
               driver.switchToPreviewPromise().then(function() {
                   driver.openModal(compIdForCompData);
                   driverDom.waitForDomElementWithinPreview('iframe', 3, 1000, 'failed').then(function(result) {
                       var modalElem = result.dom[3];
                       var n = modalElem.id.indexOf('frame');
                       var modalCompId = modalElem.id.slice(0, n - 1);
                       driver.getPublicDataValue(modalCompId, 1, 'COMPONENT', function(data) {
                           expect(data).toEqual({1: 'val1'});
                           done();
                       });
                   });
               });
           });
        });
    });
});
