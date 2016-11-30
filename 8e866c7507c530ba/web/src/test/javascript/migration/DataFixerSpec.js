describe("DataFixer", function() {

    testRequire().resources('W.Data', 'dataFixer');

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

        resource.getResources(['dataFixer'], function (res) {
            this.dataFixer = res.dataFixer;
        });

        this.addMatchers({
            toHaveOldLinkAttributesRemoved: function() {
                var fixedDataItem = this.actual;
                var oldLinkAttrNames = ['target', 'href', 'icon', 'text', 'linkType'];
                var oldAttrFound = false;

                _.forEach(oldLinkAttrNames, function(attrName){
                    oldAttrFound = !!fixedDataItem[attrName];
                }, this);

                return !oldAttrFound;
            }
        });
    });


    it("DataFixer should exist", function () {
        this.expect(this.dataFixer).toBeTruthy();
    });


    it("Should report BI error for unhandled (unknown) link types", function () {
        var dataItemId = 'dummyId';
        var linkType = "SOME_LIE";
        var documentDataItemToMigrate = {
            "type": "SiteButton",
            "id": dataItemId,
            "metaData": {
                "isPreset": false,
                "schemaVersion": "1.0",
                "isHidden": false
            },
            "linkType": linkType,
            "label": "ynet"
        };
        this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;
        spyOn(window.LOG, 'reportError').andReturn();

        this.dataFixer.fix(this.wixData);

        expect(window.LOG.reportError).
            toHaveBeenCalledWithEquivalentOf(wixErrors.UNHANDLED_LINK_TYPE, "DataFixer.Link_Refactor_Plugin", "createNewLinkItem", JSON.stringify(documentDataItemToMigrate));
    });


    describe('DataFixer schemas filter', function (){

        it("Should convert Image data item and mark as dirty", function () {
            var dataItemId = 'dummyId';
            var documentDataItemToMigrate = {
                "type": "Image",
                "id": dataItemId,
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "text": "",
                "target": "_blank",
                "linkType": "WEBSITE",
                "icon": "",
                "href": "wix.com",
                "title": "Budding Tree",
                "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                "description": "",
                "width": 1000,
                "height": 750,
                "alt": ""
            };
            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            this.dataFixer.fix(this.wixData);

            var dirtyDataItems = W.Data._dirtyDataCompIds;
            expect(dirtyDataItems[dataItemId]).toBeDefined();
        });

        it("Should convert Site Button data item and mark as dirty", function () {
            var dataItemId = 'dummyId';
            var documentDataItemToMigrate = {
                "type": "SiteButton",
                "id": dataItemId,
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "text": "",
                "target": "_blank",
                "linkType": "WEBSITE",
                "icon": "",
                "href": "http://ynet.co.il",
                "label": "ynet"
            };
            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            this.dataFixer.fix(this.wixData);

            var dirtyDataItems = W.Data._dirtyDataCompIds;
            expect(dirtyDataItems[dataItemId]).toBeDefined();
        });

        it("Should convert Flash Component data item and mark as dirty", function () {
            var dataItemId = 'dummyId';
            var documentDataItemToMigrate = {
                "type": "FlashComponent",
                "id": dataItemId,
                "metaData": {
                    "isPreset": true,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "text": "",
                "target": "_blank",
                "linkType": "WEBSITE",
                "icon": "",
                "href": "http://ynet.co.il",
                "uri": "",
                "width": 0,
                "height": 0,
                "placeHolderImage": "#c_placeHolderImage1dea"
            };
            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            this.dataFixer.fix(this.wixData);

            var dirtyDataItems = W.Data._dirtyDataCompIds;
            expect(dirtyDataItems[dataItemId]).toBeDefined();
        });

        it("Should NOT convert data item with \"link\" attribute (already in new format)", function () {
            var dataItemId = 'dummyId';
            var documentDataItemToMigrate = {
                "type": "Image",
                "id": dataItemId,
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "1.0",
                    "isHidden": false
                },
                "title": "Budding Tree",
                "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                "description": "",
                "width": 1000,
                "height": 750,
                "alt": "",
                "link": "#hobd"
            };
            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            this.dataFixer.fix(this.wixData);

            var dirtyDataItems = W.Data._dirtyDataCompIds;
            expect(dirtyDataItems[dataItemId]).toBeUndefined();
        });

        it("Should NOT convert Image data item that was already converted (schema version 2.0)", function () {
            var dataItemId = 'dummyId';
            var documentDataItemToMigrate = {
                "type": "Image",
                "id": dataItemId,
                "metaData": {
                    "isPreset": false,
                    "schemaVersion": "2.0",
                    "isHidden": false
                },
                "title": "Budding Tree",
                "uri": "44dab8ba8e2b5ec71d897466745a1623.jpg",
                "description": "",
                "width": 1000,
                "height": 750,
                "alt": ""
            };
            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            this.dataFixer.fix(this.wixData);

            var dirtyDataItems = W.Data._dirtyDataCompIds;
            expect(dirtyDataItems[dataItemId]).toBeUndefined();
        });
    });


    describe('Document links migration to a new dedicated link type', function (){

        function getDocumentDataItemToMigrate(href, target, text){
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

        beforeEach(function (){
            this.getDocumentDataItemToMigrate = getDocumentDataItemToMigrate;
        });

        it("should migrate document link WITHOUT ?dn= parameter", function () {
            var href = "http://media.wix.com/ugd/32d4ec_b8547c36cfbb490d70d89abdea857936.docx";
            var target = "_blank";
            var text = "Orientation+Feedback+Form.docx";
            var documentDataItemToMigrate = this.getDocumentDataItemToMigrate(href, target, text);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("DocumentLink");
            expect(fixedLinksData[linkId].docId).toBe("32d4ec_b8547c36cfbb490d70d89abdea857936.docx");
            expect(fixedLinksData[linkId].name).toBe(text);
        });

        it("should migrate document link WITH ?dn= parameter", function () {
            var text = "Orientation+Feedback+Form.docx";
            var href = "http://media.wix.com/ugd/32d4ec_b8547c36cfbb490d70d89abdea857936.docx?dn=" + text;
            var target = "_blank";
            var documentDataItemToMigrate = this.getDocumentDataItemToMigrate(href, target, text);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("DocumentLink");
            expect(fixedLinksData[linkId].docId).toBe("32d4ec_b8547c36cfbb490d70d89abdea857936.docx");
            expect(fixedLinksData[linkId].name).toBe(text);
        });
    });


    describe('External (website) links migration to a new dedicated link type', function (){

        function getWebsiteDataItemToMigrate(href, target){
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

        beforeEach(function (){
            this.getWebsiteDataItemToMigrate = getWebsiteDataItemToMigrate;
        });

        it("Should migrate website link", function () {
            var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
            var target = "_blank";
            var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("ExternalLink");
            expect(fixedLinksData[linkId].url).toBe(href);
            expect(fixedLinksData[linkId].target).toBe(target);
        });

        it("Should migrate website link with old target (same)", function () {
            var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
            var target = "same";
            var expectedTarget = "_self";
            var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("ExternalLink");
            expect(fixedLinksData[linkId].url).toBe(href);
            expect(fixedLinksData[linkId].target).toBe(expectedTarget);
        });

        it("Should migrate website link with old target (other)", function () {
            var href = "http://www.nyu.edu:8080/academics/schools-and-colleges.html";
            var target = "other";
            var expectedTarget = "_blank";
            var documentDataItemToMigrate = this.getWebsiteDataItemToMigrate(href, target);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("ExternalLink");
            expect(fixedLinksData[linkId].url).toBe(href);
            expect(fixedLinksData[linkId].target).toBe(expectedTarget);
        });
    });


    describe('Email links migration to a new dedicated link type', function (){

        function getEmailDataItemToMigrate(email, subject, body){
            var href = "mailto:" + email
            if(subject) href += "?subject=" + subject;
            if(body) href += ((subject) ? "&" : "?") + "body=" + body;

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

        beforeEach(function (){
            this.getEmailDataItemToMigrate = getEmailDataItemToMigrate;
        });

        it("Should migrate email link without parameters", function () {
            var email = "info@wix.com";
            var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email);

            this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedMailData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedMailData[emailDataItemToMigrate.id].link.substr(1);

            expect(fixedMailData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedMailData[emailDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].recipient).toBe(email);
            expect(fixedLinksData[linkId].subject).toBeUndefined();
            expect(fixedLinksData[linkId].body).toBeUndefined();
        });

        it("Should migrate email link with subject", function () {
            var email = "info@wix.com";
            var subject = 'Test Subject';
            var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, subject);

            this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedMailData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedMailData[emailDataItemToMigrate.id].link.substr(1);

            expect(fixedMailData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedMailData[emailDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].recipient).toBe(email);
            expect(fixedLinksData[linkId].subject).toBe(subject);
            expect(fixedLinksData[linkId].body).toBeUndefined();
        });

        it("Should migrate email link with body", function () {
            var email = "info@wix.com";
            var body = 'Test Body';
            var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, '', body);

            this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedMailData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedMailData[emailDataItemToMigrate.id].link.substr(1);

            expect(fixedMailData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedMailData[emailDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].recipient).toBe(email);
            expect(fixedLinksData[linkId].subject).toBeUndefined();
            expect(fixedLinksData[linkId].body).toBe(body);
        });

        it("Should migrate email link with subject and body", function () {
            var email = "info@wix.com";
            var subject = 'Test Subject';
            var body = 'Test Body';
            var emailDataItemToMigrate = this.getEmailDataItemToMigrate(email, subject, body);

            this.wixData.document_data[emailDataItemToMigrate.id] = emailDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedMailData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedMailData[emailDataItemToMigrate.id].link.substr(1);

            expect(fixedMailData[emailDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedMailData[emailDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].recipient).toBe(email);
            expect(fixedLinksData[linkId].subject).toBe(subject);
            expect(fixedLinksData[linkId].body).toBe(body);
        });
    });


    describe('Page links migration to a new dedicated link type', function (){

        function getPageDataItemToMigrate(href){
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

        beforeEach(function (){
            this.getPageDataItemToMigrate = getPageDataItemToMigrate;
        });

        it("Should migrate page link", function () {
            var pageId = 'cwhd';
            var pageUriSEO = 'gallery---thumbnails';
            var href = "#!" + pageUriSEO + "/" + pageId;
            var documentDataItemToMigrate = this.getPageDataItemToMigrate(href);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("PageLink");
            expect(fixedLinksData[linkId].pageId).toBe("#" + pageId);
        });

        it("Should migrate page link with legacy | separator", function () {
            var pageId = 'cwhd';
            var pageUriSEO = 'gallery---thumbnails';
            var href = "#!" + pageUriSEO + "|" + pageId;
            var documentDataItemToMigrate = this.getPageDataItemToMigrate(href);

            this.wixData.document_data[documentDataItemToMigrate.id] = documentDataItemToMigrate;

            var fixedData = this.dataFixer.fix(this.wixData);
            var fixedDocumentData = fixedData.document_data;
            var fixedLinksData = fixedData.links_data;
            var linkId = fixedDocumentData[documentDataItemToMigrate.id].link.substr(1);

            expect(fixedDocumentData[documentDataItemToMigrate.id]).toHaveOldLinkAttributesRemoved();
            expect(fixedDocumentData[documentDataItemToMigrate.id].link).toBeTruthy();

            expect(fixedLinksData[linkId].type).toBe("PageLink");
            expect(fixedLinksData[linkId].pageId).toBe("#" + pageId);
        });
    });

    describeExperiment({"BugFixesForReact": "New"}, "add bottom parent anchor to to the bottom most component of page if missing", function(){
        function mockComp(id, y, height, anchors) {
            return {
                id: id,
                layout: {x: 0, y: y, height: height, anchors: anchors ? anchors : [], rotationInDegrees: 0}
            };
        }

        function addBottomParentAnchor(page, compId) {
            var anchor = {
                distance: 10,
                type: "BOTTOM_PARENT",
                targetComponent: page.structure.id,
                locked: false,
                originalValue: 0,
                topToTop: 0
            };
            var comp = _.find(page.structure.components, {id: compId});
            comp.layout.anchors.push(anchor);
        }

        function testCompAnchors(page, compId, clonedPage){
            var comp = _.find(page.structure.components, {id: compId});
            expect(comp.layout.anchors.length).toBe(1);
            expect(comp.layout.anchors[0].type).toBe('BOTTOM_PARENT');
            comp.layout.anchors = [];
            expect(page).toEqual(clonedPage);
        }

        beforeEach(function(){
            this.page = {
                structure: {
                    id: 'page',
                    components:[
                        mockComp('top', 10, 100),
                        mockComp('bottom', 50, 100)
                    ],
                    layout: {height: 100, y: 0}
                },
                data : { document_data : {  }, theme_data : {  }, component_properties : {  }, links_data : { } }
            };
        });

        it("should do nothing if the bottom most comp has a bottom parent anchor", function(){
            addBottomParentAnchor(this.page, 'bottom');
            var clonedPage = _.cloneDeep(this.page);

            this.dataFixer.FixPageJson(this.page);

            expect(this.page).toEqual(clonedPage);
        });
        it("should add anchor to the bottom most page child if no page child has bottom parent anchors", function(){
            var clonedPage = _.cloneDeep(this.page);
            this.dataFixer.FixPageJson(this.page);

            testCompAnchors(this.page, 'bottom', clonedPage);
        });

        it("should add anchor to the bottom most page child if another component has a bottom parent anchor", function(){
            addBottomParentAnchor(this.page, 'top');
            var clonedPage = _.cloneDeep(this.page);

            this.dataFixer.FixPageJson(this.page);

            testCompAnchors(this.page, 'bottom', clonedPage);
        });

        it("should add the anchor to the bottom most component even if it's y is smaller but it's height covers for it", function(){
            this.page.structure.components.unshift(mockComp('bottomMost', 30, 200));
            var clonedPage = _.cloneDeep(this.page);
            this.dataFixer.FixPageJson(this.page);

            testCompAnchors(this.page, 'bottomMost', clonedPage);
        });
    });

    describeExperiment({"BugFixesForReact": "New"}, "fix broken anchors", function(){

        function mockComp(id, y, height, anchors, children) {
            return {
                id: id,
                children: children ? children : [],
                layout: {x: 0, y: y, height: height, anchors: anchors ? anchors : [], rotationInDegrees: 0}
            };
        }

        function mockAnchor(type, target, distance, locked, originalValue) {
            return {
                distance: distance,
                type: type,
                targetComponent: target,
                locked: !!locked,
                originalValue: originalValue ? originalValue : 0,
                topToTop: 0
            };
        }

        beforeEach(function(){
            this.page = {
                structure: {
                    id: 'page',
                    components:[],
                    layout: {height: 100, y: 0}
                },
                data : { document_data : {  }, theme_data : {  }, component_properties : {  }, links_data : { } }
            };
        });

        it("should remove anchors between components in different containers", function(){
            this.page.structure.components = [
                mockComp('a', 0, 0),
                mockComp('b', 0, 0, [], [
                    mockComp('b1', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'a', 0, true), mockAnchor('BOTTOM_BOTTOM', 'b2', 0), mockAnchor('TOP_TOP', 'a', 0), mockAnchor('BOTTOM_TOP', 'a', 0)]),
                    mockComp('b2', 0, 0, [])
                ])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[1].children[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b2', 0)]);
        });

        it("should remove BOTTOM_PARENT anchors if they don't point to parent", function(){
            this.page.structure.components = [
                mockComp('a', 0, 0, [], [
                    mockComp('a1', 0, 0, [mockAnchor('BOTTOM_PARENT', 'a', '0'), mockAnchor('BOTTOM_PARENT', 'page', '0')])
                ])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].children[0].layout.anchors).toEqual([mockAnchor('BOTTOM_PARENT', 'a', '0')]);
        });

        it("should remove BOTTOM_BOTTOM anchors to a non resizable component", function(){
            var unResizableComponent = mockComp('c', 50, 30, []);
            unResizableComponent.componentType = 'wysiwyg.viewer.components.FacebookShare';
            this.page.structure.components = [
                mockComp('a', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'c', 0, false, 100), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]),
                mockComp('b', 50, 30, []),
                unResizableComponent
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]);
        });

        it("should set original value to be not bigger than target height for BOTTOM_BOTTOM anchors, ", function(){
            this.page.structure.components = [
                mockComp('a', 0, 0, [mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 100), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]),
                mockComp('b', 50, 30, [])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 30), mockAnchor('BOTTOM_BOTTOM', 'b', 0, false, 25)]);
        });

        it("should set original value to be not bigger than target height for BOTTOM_PARENT anchors, ", function(){
            this.page.structure.components = [
                mockComp('a', 50, 30, [], [
                    mockComp('a1', 0, 0, [mockAnchor('BOTTOM_PARENT', 'a', 0, true, 100), mockAnchor('BOTTOM_PARENT', 'a', 0, false, 25)])
                ])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].children[0].layout.anchors).toEqual([mockAnchor('BOTTOM_PARENT', 'a', 0, true, 30), mockAnchor('BOTTOM_PARENT', 'a', 0, false, 25)]);
        });

        it("should set original value to be not bigger than target top for BOTTOM_TOP anchors", function(){
            this.page.structure.components = [
                mockComp('a', 0, 0, [mockAnchor('BOTTOM_TOP', 'b', 0, false, 100), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]),
                mockComp('b', 50, 30, [])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('BOTTOM_TOP', 'b', 0, false, 50), mockAnchor('BOTTOM_TOP', 'b', 0, false, 25)]);
        });

        it("should set original value to be not bigger than target top for TOP_TOP anchors", function(){
            this.page.structure.components = [
                mockComp('a', 0, 0, [mockAnchor('TOP_TOP', 'b', 0, false, 100), mockAnchor('TOP_TOP', 'b', 0, false, 25)]),
                mockComp('b', 50, 30, [])
            ];

            this.dataFixer.FixPageJson(this.page);

            expect(this.page.structure.components[0].layout.anchors).toEqual([mockAnchor('TOP_TOP', 'b', 0, false, 50), mockAnchor('TOP_TOP', 'b', 0, false, 25)]);
        });
    });

    describeExperiment({"filterText": "New"}, "fix text security issues", function(){


        beforeEach(function(){
            this.page = {
                structure: {
                    id: 'page',
                    components:[],
                    layout: {height: 100, y: 0}
                },
                data : {
                    document_data : {
                        unsequreList : {
                                        text:   '<a href="JaVaScriPt:alert(Hi);">Test</a>gaga' +
                                                '<a href = "    javaScript:alert(Hi)">Test2</a>' +
                                                '<a href = "java    script:alert(Hi)">Test my Script</a     >' +
                                                '<a href="#" alt="lala" Onclick    = "alert(Hi)">Test OnClick=alert(Hi)</a>' +
                                                '<a href="" onDragLeave="alert(Hi)">zaza</a>' +
                                                '<a href="jav&#x0A;ascript:alert(Hi);">gaga</a>' +
                                                '<a href="jav&#x09;ascript:alert(Hi);">baga</a>' +
                                                '<img src=" javascript:alert(Hi);">' +
                                                '<!--<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>-->' +
                                                '<!--    <<SCRIPT>alert("XSS");//<</SCRIPT>   -->' +
                                                '<SCRIPT>alert("XSS");</SCRIPT>' +
                                                '<tag style="xss:expression(alert(Hi))">xss:expression(alert(Hi))</tag>' +
                                                '<DIV STYLE="width: expression(alert(XSS));">haha</DIV>',
                                        type: 'StyledText'
                        },

                        sequreList : {
                                        text:   'JaVaScriPt:alert(Hi);' +
                                                '<a href = "">JaVaScriPt:alert(Hi);</a>' +
                                                'Test my Script' +
                                                '<a href="#" alt="lala">Test OnClick=alert(Hi)</a>' +
                                                '<img src="sagwgsd">' +
                                                '<tag style="width:15px">xss:expression(alert(Hi))</tag>' +
                                                '<DIV STYLE="width:100%">haha</DIV>',
                                        type: 'StyledText'
                        }

                    },
                    theme_data : {  },
                    component_properties : {  },
                    links_data : { } }
            };
        });

        it("should pass sequre text parts", function(){
            var mockDocumentData = {
                                    sequreList : {
                                        text:   'JaVascript:alert(Hi);' +
                                                '<a href="">JaVascript:alert(Hi);</a>' +
                                                'Test my Script' +
                                                '<a href="#" alt="lala">Test onClick=alert(Hi)</a>' +
                                                '<img src="sagwgsd">' +
                                                '<tag style="width:15px">xss:expression(alert(Hi))</tag>' +
                                                '<div style="width:100%">haha</div>',
                                        type: 'StyledText'
                                    }
                                }
            this.dataFixer.FixPageJson(this.page);
            expect(this.page.data.document_data.sequreList.text).toEqual(mockDocumentData.sequreList.text);
        });

        it("should remove unsecured text parts", function(){
            var mockDocumentData = {
                                    unsequreList : {
                                        text:   '<a>Test</a>gaga' +
                                                '<a>Test2</a>' +
                                                '<a>Test my Script</a>' +
                                                '<a href="#" alt="lala">Test onClick=alert(Hi)</a>' +
                                                '<a href="">zaza</a>' +
                                                '<a>gaga</a>' +
                                                '<a>baga</a>' +
                                                '<img>' +
                                                '<tag>xss:expression(alert(Hi))</tag>' +
                                                '<div>haha</div>',
                                        type: 'StyledText'
                }
            }
            this.dataFixer.FixPageJson(this.page);
            expect(this.page.data.document_data.unsequreList.text).toEqual(mockDocumentData.unsequreList.text);
        });

    });
});