define(['dataFixer/plugins/pageUriSeoFixer'], function (pageUriSeoFixer) {
    'use strict';

    describe('pageUriSeoFixer', function () {

        function getPageJson() {
            return {
                data: {
                    document_data: {}
                }
            };
        }

        function getUrlFormatModel(format) {
            return {
                format: format,
                forbiddenPageUriSEOs: {},
                pageIdToResolvedUriSEO: {
                    b: {
                        prev: 'duplicate',
                        curr: 'duplicate-b'
                    },
                    c: {
                        prev: 'duplicate',
                        curr: 'duplicate-c'
                    },
                    d: {
                        prev: 'forbidden',
                        curr: 'forbidden-d'
                    }
                }
            };
        }

        function addPage(json, id, pageUriSEO) {
            json.data.document_data[id] = {
                type: 'Page',
                id: id,
                pageUriSEO: pageUriSEO
            };
        }

        beforeEach(function () {
            this.pageJson = getPageJson();

            addPage(this.pageJson, 'a', 'unique');
            addPage(this.pageJson, 'b', 'duplicate');
            addPage(this.pageJson, 'c', 'duplicate');
            addPage(this.pageJson, 'd', 'forbidden');
        });

        it('should apply resolved pageUriSEO from urlFormatModel if format is "slash"', function () {
            this.urlFormatModel = getUrlFormatModel('slash');

            pageUriSeoFixer.exec(this.pageJson, [], null, null, this.urlFormatModel);

            expect(this.pageJson.data.document_data.a.pageUriSEO).toBe('unique');
            expect(this.pageJson.data.document_data.b.pageUriSEO).toBe('duplicate-b');
            expect(this.pageJson.data.document_data.c.pageUriSEO).toBe('duplicate-c');
            expect(this.pageJson.data.document_data.d.pageUriSEO).toBe('forbidden-d');
        });

        it('should do nothing if format is not "slash"', function () {
            this.urlFormatModel = getUrlFormatModel('hashBang');

            pageUriSeoFixer.exec(this.pageJson, [], null, null, this.urlFormatModel);

            expect(this.pageJson.data.document_data.a.pageUriSEO).toBe('unique');
            expect(this.pageJson.data.document_data.b.pageUriSEO).toBe('duplicate');
            expect(this.pageJson.data.document_data.c.pageUriSEO).toBe('duplicate');
            expect(this.pageJson.data.document_data.d.pageUriSEO).toBe('forbidden');
        });

        it('should do nothing if no urlFormatModel is provided', function () {
            pageUriSeoFixer.exec(this.pageJson, []);

            expect(this.pageJson.data.document_data.a.pageUriSEO).toBe('unique');
            expect(this.pageJson.data.document_data.b.pageUriSEO).toBe('duplicate');
            expect(this.pageJson.data.document_data.c.pageUriSEO).toBe('duplicate');
            expect(this.pageJson.data.document_data.d.pageUriSEO).toBe('forbidden');
        });

    });
});
