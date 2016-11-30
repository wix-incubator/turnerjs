define(['lodash', 'dataFixer/plugins/linkRefDataFixer'], function(_, linkRefDataFixer) {
    'use strict';
    
    describe('linkRefDataFixer spec', function() {

        beforeEach(function () {
            this.wixData = {
                "document_data": {
                    "mainPage": {
                        "type": "Page",
                        "id": "mainPage",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "Home",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "home",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false
                        }
                    }
                }
            };

            jasmine.addMatchers({
                toHaveOldLinkAttributesRemoved: function () {
                    return { //
                        compare: function (actual) {
                            var fixedDataItem = actual;
                            var oldLinkAttrNames = ['target', 'href', 'icon', 'text', 'linkType'];
                            var oldAttrFound = false;

                            _.forEach(oldLinkAttrNames, function (attrName) {
                                oldAttrFound = !!fixedDataItem[attrName];
                            }, this);

                            return {pass: !oldAttrFound};
                        }
                    };
                }
            });
        });
        
        describe('Document links migration to a new dedicated link type', function () {

            function getDocumentDataItemToMigrate(href, target, text) {
                return {
                    "type": "Image",
                    "id": "ch8h",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "text": text,
                    "target": target,
                    "linkType": "DOCUMENT",
                    "icon": "",
                    "href": href,
                    "title": "Budding Tree",
                    "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                    "description": "",
                    "width": 1000,
                    "height": 750,
                    "alt": ""
                };
            }

            beforeEach(function () {
                this.getDocumentDataItemToMigrate = getDocumentDataItemToMigrate;
            });

            it("should migrate document link WITHOUT ?dn= parameter", function () {
                var href = "http://media.wix.com/ugd/32d4ec_b8547c36cfbb490d70d89abdea857936.docx";
                var target = "_blank";
                var text = "Orientation+Feedback+Form.docx";
                var documentDataItemToMigrate = this.getDocumentDataItemToMigrate(href, target, text);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("DocumentLink");
                expect(fixedDocumentData[linkId].docId).toBe("32d4ec_b8547c36cfbb490d70d89abdea857936.docx");
                expect(fixedDocumentData[linkId].name).toBe(text);
            });

            it("should migrate document link WITH ?dn= parameter", function () {
                var text = "Orientation+Feedback+Form.docx";
                var href = "http://media.wix.com/ugd/32d4ec_b8547c36cfbb490d70d89abdea857936.docx?dn=" + text;
                var target = "_blank";
                var documentDataItemToMigrate = this.getDocumentDataItemToMigrate(href, target, text);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("DocumentLink");
                expect(fixedDocumentData[linkId].docId).toBe("32d4ec_b8547c36cfbb490d70d89abdea857936.docx");
                expect(fixedDocumentData[linkId].name).toBe(text);
            });
        });

        describe('External (website) links migration to a new dedicated link type', function () {

            function getWebsiteDataItemToMigrate(href, target) {
                return {
                    "type": "Image",
                    "id": "ch8h",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "text": "",
                    "target": target,
                    "linkType": "WEBSITE",
                    "icon": "",
                    "href": href,
                    "title": "Budding Tree",
                    "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                    "description": "",
                    "width": 1000,
                    "height": 750,
                    "alt": ""
                };
            }

            beforeEach(function () {
                this.getWebsiteDataItemToMigrate = getWebsiteDataItemToMigrate;
            });

            it("Should migrate website link", function () {
                var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
                var target = "_blank";
                var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("ExternalLink");
                expect(fixedDocumentData[linkId].url).toBe(href);
                expect(fixedDocumentData[linkId].target).toBe(target);
            });

            it("Should migrate website link with old target (same)", function () {
                var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
                var target = "same";
                var expectedTarget = "_self";
                var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("ExternalLink");
                expect(fixedDocumentData[linkId].url).toBe(href);
                expect(fixedDocumentData[linkId].target).toBe(expectedTarget);
            });

            it("Should migrate website link with old target (other)", function () {
                var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
                var target = "other";
                var expectedTarget = "_blank";
                var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("ExternalLink");
                expect(fixedDocumentData[linkId].url).toBe(href);
                expect(fixedDocumentData[linkId].target).toBe(expectedTarget);
            });
        });

        describe('Email links migration to a new dedicated link type', function () {

            function getEmailDataItemToMigrate(email, subject, body) {
                var href = "mailto:" + email;
                if (subject) {
                    href += "?subject=" + subject;
                }
                if (body) {
                    href += ((subject) ? "&" : "?") + "body=" + body;
                }

                return {
                    "type": "Image",
                    "id": "ch8h",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "text": '',
                    "target": "_blank",
                    "linkType": "EMAIL",
                    "icon": "",
                    "href": href,
                    "title": "Budding Tree",
                    "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                    "description": "",
                    "width": 1000,
                    "height": 750,
                    "alt": ""
                };
            }

            beforeEach(function () {
                this.getEmailDataItemToMigrate = getEmailDataItemToMigrate;
            });

            it("Should migrate email link without parameters", function () {
                var email = "info@wix.com";
                var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email);

                this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[emailDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[emailDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].recipient).toBe(email);
                expect(fixedDocumentData[linkId].subject).toBeUndefined();
                expect(fixedDocumentData[linkId].body).toBeUndefined();
            });

            it("Should migrate email link with subject", function () {
                var email = "info@wix.com";
                var subject = 'Test Subject';
                var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, subject);

                this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[emailDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[emailDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].recipient).toBe(email);
                expect(fixedDocumentData[linkId].subject).toBe(subject);
                expect(fixedDocumentData[linkId].body).toBeUndefined();
            });

            it("Should migrate email link with body", function () {
                var email = "info@wix.com";
                var body = 'Test Body';
                var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, '', body);

                this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[emailDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[emailDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].recipient).toBe(email);
                expect(fixedDocumentData[linkId].subject).toBeUndefined();
                expect(fixedDocumentData[linkId].body).toBe(body);
            });

            it("Should migrate email link with subject and body", function () {
                var email = "info@wix.com";
                var subject = 'Test Subject';
                var body = 'Test Body';
                var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, subject, body);

                this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[emailDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[emailDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].recipient).toBe(email);
                expect(fixedDocumentData[linkId].subject).toBe(subject);
                expect(fixedDocumentData[linkId].body).toBe(body);
            });
        });

        describe('Page links migration to a new dedicated link type', function () {

            function getPageDataItemToMigrate(href) {
                return {
                    "type": "Image",
                    "id": "ch8h",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "text": "",
                    "target": "_self",
                    "linkType": "PAGE",
                    "icon": "",
                    "href": href,
                    "title": "Budding Tree",
                    "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                    "description": "",
                    "width": 1000,
                    "height": 750,
                    "alt": ""
                };
            }

            beforeEach(function () {
                this.getPageDataItemToMigrate = getPageDataItemToMigrate;
            });

            it("Should migrate page link", function () {
                var pageId = 'cwhd';
                var pageUriSEO = 'gallery---thumbnails';
                var href = "#!" + pageUriSEO + "/" + pageId;
                var documentDataItemToMigrate = this.getPageDataItemToMigrate(href);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("PageLink");
                expect(fixedDocumentData[linkId].pageId).toBe("#" + pageId);
            });

            it("Should migrate page link with legacy | separator", function () {
                var pageId = 'cwhd';
                var pageUriSEO = 'gallery---thumbnails';
                var href = "#!" + pageUriSEO + "|" + pageId;
                var documentDataItemToMigrate = this.getPageDataItemToMigrate(href);

                this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

                linkRefDataFixer.exec({data: this.wixData});
                var fixedDocumentData = this.wixData.document_data;
                var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

                expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
                expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

                expect(fixedDocumentData[linkId].type).toBe("PageLink");
                expect(fixedDocumentData[linkId].pageId).toBe("#" + pageId);
            });
        });
    });
});
