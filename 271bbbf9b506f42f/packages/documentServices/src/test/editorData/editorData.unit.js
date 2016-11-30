define(['lodash',
    'definition!documentServices/editorData/editorData',
    'documentServices/editorData/composersHandler',
    'fake!documentServices/editorData/editorDataPath',
    'documentServices/mockPrivateServices/privateServicesHelper'], function (_, editorDataDefinition, composersHandler, fakeEditorDataPath, privateServicesHelper) {

    'use strict';

    var editorDataService = editorDataDefinition(_, composersHandler, fakeEditorDataPath),
        ps,
        DAL,
        composers = composersHandler.COMPOSERS,
        composerKeys = _.keys(composers),
        editorDataVersion = editorDataService.getVersion(),
        mockComposerClass = composers[_.sample(composerKeys, 1)],
        mockComposerKey = mockComposerClass.key,
        fakeComposedData = {data: 'COMPOSED_DATA'},
        fakePaths = {
            pagesData: ['pagesData'],
            editorData: ['editorData'],
            generatedData: ['editorData', 'generated'],
            generatedVersion: ['editorData', 'generatedVersion'],
            composerPath: ['editorData', 'generated', mockComposerKey]
        };

    xdescribe('Document Services - Editor Data', function () {

        beforeEach(function () {
            ps = ps || privateServicesHelper.mockPrivateServicesWithRealDAL();
            DAL = ps.dal;

            spyOn(fakeEditorDataPath, 'getComposerPointer').and.returnValue(fakePaths.composerPath);
            spyOn(fakeEditorDataPath, 'getGeneratedDataPointer').and.returnValue(fakePaths.generatedData);
            spyOn(fakeEditorDataPath, 'getGeneratedVersionPointer').and.returnValue(fakePaths.generatedVersion);

            _.forEach(composers, function (composer) {
                spyOn(composer, 'compose').and.returnValue(fakeComposedData);
            });

            DAL.set(fakePaths.editorData, {});
            DAL.set(fakePaths.pagesData, {});
        });

        describe('Testing `getComposerData` method', function () {

            it('Should compose only the pages listed in pagesData and ignore existing composer pages', function () {
                var mockPagesData = generatePageDataMock({numberOfPages: 2});
                var mockEditorData = generateEditorDataMock({numberOfPages: 4, fakeData: 'SOME_DATA'});
                DAL.set(fakePaths.editorData, mockEditorData);
                DAL.set(fakePaths.pagesData, mockPagesData);

                var composedData = editorDataService.getComposerData(ps, mockComposerClass);

                // updated composerData
                expect(composedData.page1).toEqual(fakeComposedData);
                expect(composedData.page2).toEqual(fakeComposedData);

                // untouched composerData
                expect(composedData.page3).toEqual({data: 'SOME_DATA'});
                expect(composedData.page4).toEqual({data: 'SOME_DATA'});
            });

            it('Should remove deleted pages from composedData', function () {

                var mockPagesData = generatePageDataMock({numberOfPages: 2});
                var mockEditorData = generateEditorDataMock({numberOfPages: 2, fakeData: 'SOME_DATA'});
                // mock deleted page
                mockPagesData.page1 = null;

                DAL.set(fakePaths.editorData, mockEditorData);
                DAL.set(fakePaths.pagesData, mockPagesData);

                var composedData = editorDataService.getComposerData(ps, mockComposerClass);
                expect(composedData.page1).toBeUndefined();
                expect(composedData.page2).toEqual(fakeComposedData);
            });
        });

        describe('Testing `initialize` method', function () {

            it('Should generate new editorData when DAL does not have any editorData', function () {
                var mockPagesData = generatePageDataMock({numberOfPages: 2});
                DAL.set(fakePaths.pagesData, mockPagesData);

                editorDataService.initialize(ps);

                expect(DAL.get(fakePaths.composerPath)).toBeDefined();
                expect(DAL.get(fakePaths.composerPath.concat('page1'))).toEqual(fakeComposedData);
                expect(DAL.get(fakePaths.composerPath.concat('page2'))).toEqual(fakeComposedData);
                expect(DAL.get(fakePaths.generatedVersion)).toEqual(editorDataVersion);
            });

            it('Should NOT alter a perfectly valid editorData structure', function () {
                var mockEditorData = generateEditorDataMock({numberOfPages: 2});
                DAL.set(fakePaths.editorData, mockEditorData);

                editorDataService.initialize(ps);

                expect(DAL.get(fakePaths.generatedData)).toEqual(mockEditorData.generated);
                expect(DAL.get(fakePaths.generatedVersion)).toEqual(mockEditorData.generatedVersion);
            });

            it('Should generate new editorData when generatedVersion does not equal to current editorData version', function () {
                var mockPagesData = generatePageDataMock({numberOfPages: 1});
                var mockEditorData = generateEditorDataMock({numberOfPages: 1, generatedVersion: '0.000001'});

                DAL.set(fakePaths.editorData, mockEditorData);
                DAL.set(fakePaths.pagesData, mockPagesData);

                editorDataService.initialize(ps);

                expect(DAL.get(fakePaths.generatedData)).not.toEqual(mockEditorData.generated);
                expect(DAL.get(fakePaths.composerPath)).toBeDefined();
                expect(DAL.get(fakePaths.composerPath.concat('page1'))).toEqual(fakeComposedData);
                expect(DAL.get(fakePaths.generatedVersion)).toEqual(editorDataVersion);
            });
        });

    });

    function generateEditorDataMock(params) {
        params = params || {};

        var numberOfPages = params.numberOfPages ? params.numberOfPages : 1;
        var mockGeneratedVersion = params.generatedVersion ? params.generatedVersion : editorDataVersion;
        var fakeData = params.fakeData ? params.fakeData : 'FAKE';
        var data = {};

        data[mockComposerKey] = {};

        for (var i = 1; i <= numberOfPages; i++) {
            data[mockComposerKey]['page' + i] = {
                data: fakeData
            };
        }

        return {
            generated: data,
            generatedVersion: mockGeneratedVersion
        };
    }

    function generatePageDataMock(params) {
        params = params || {};
        var numberOfPages = params.numberOfPages ? params.numberOfPages : 1;
        var fakeData = params.fakeData ? params.fakeData : 'FAKE';
        var pages = {};

        for (var i = 1; i <= numberOfPages; i++) {
            pages['page' + i] = {
                data: fakeData
            };
        }
        return pages;
    }
});
