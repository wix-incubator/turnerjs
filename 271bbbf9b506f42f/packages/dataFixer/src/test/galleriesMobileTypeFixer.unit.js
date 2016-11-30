define(['testUtils',
    'lodash',
    'dataFixer/helpers/CompsMigrationHelper',
    'definition!dataFixer/plugins/galleriesMobileTypeFixer'], function(testUtils, _, CompsMigrationHelper, galleriesMobileTypeFixerDef){
    'use strict';
    describe('galleriesMobileTypeFixer', function(){
        var factory = testUtils.mockFactory;
        var galleryType1 = 'galleryType1';
        var galleryType2 = 'galleryType2';
        var galleryType3 = 'galleryType3';
        var gallery1PropType = 'galleryProp1';
        var gallery2PropType = 'galleryProp2';


        var pageId = 'page1';
        var map = {};
        map[galleryType1] = {propType: gallery1PropType};
        map[galleryType2] = {propType: gallery2PropType};
        map[galleryType3] = {propType: gallery2PropType};

        var galleriesMobileTypeFixer = galleriesMobileTypeFixerDef(_, CompsMigrationHelper, map);
        beforeEach(function(){
            this.siteData = factory.mockSiteData();
        });

        it('should do nothing if not a gallery even if the comp has different types in mobile and desktop', function(){
            this.siteData.addPageWithDefaults('page1',
                [factory.createStructure('someComp', {}, 'c1')],
                [factory.createStructure('otherComp', {}, 'c1')]);

            var page = this.siteData.getPageData(pageId);
            var pageBefore = _.cloneDeep(page);

            galleriesMobileTypeFixer.exec(page);

            expect(page).toEqual(pageBefore);
        });

        //add props style and such
        it('should do nothing if desktop and mobile gallery have same type', function(){
            this.siteData.addPageWithDefaults('page1',
                [factory.createStructure(galleryType1, {}, 'c1')],
                [factory.createStructure(galleryType1, {}, 'c1')]);

            var page = this.siteData.getPageData(pageId);
            var pageBefore = _.cloneDeep(page);

            galleriesMobileTypeFixer.exec(page);

            expect(page).toEqual(pageBefore);
        });

        describe('when mobile and desktop galleries have different type', function(){

            it('should change mobile comp type but not properties if they are correct for the type', function(){
                this.siteData.addPageWithDefaults('page1',
                    [factory.createStructure(galleryType1, {propertyQuery: 'p1'}, 'c1')],
                    [factory.createStructure(galleryType2, {propertyQuery: 'p2'}, 'c1')]);
                this.siteData.addProperties({type: gallery1PropType, id: 'p1'}, pageId);
                this.siteData.addProperties({type: gallery1PropType, id: 'p2'}, pageId);

                var page = this.siteData.getPageData(pageId);
                var pageBefore = _.cloneDeep(page);

                galleriesMobileTypeFixer.exec(page);

                var mobileComp = page.structure.mobileComponents[0];
                expect(mobileComp.componentType).toBe(galleryType1);

                mobileComp.componentType = galleryType2;
                expect(page).toEqual(pageBefore);
            });

            //if the desktop gallery type has split properties it would have change the mobile comp properties in the algo
            //so if the mobile properties don't match the desired comp type, mobile properties should be the same as desktop
            it('should change mobile comp type and properties to be the same as desktop if they are wrong for the type', function(){
                this.siteData.addPageWithDefaults('page1',
                    [factory.createStructure(galleryType1, {propertyQuery: 'p1'}, 'c1')],
                    [factory.createStructure(galleryType2, {propertyQuery: 'p2'}, 'c1')]);
                this.siteData.addProperties({type: gallery1PropType, id: 'p1'}, pageId);
                this.siteData.addProperties({type: gallery2PropType, id: 'p2'}, pageId);

                var page = this.siteData.getPageData(pageId);
                var pageBefore = _.cloneDeep(page);

                galleriesMobileTypeFixer.exec(page);

                var mobileComp = page.structure.mobileComponents[0];
                expect(mobileComp.componentType).toBe(galleryType1);
                expect(mobileComp.propertyQuery).toBe('p1');

                mobileComp.componentType = galleryType2;
                mobileComp.propertyQuery = 'p2';
                expect(page).toEqual(pageBefore);
            });
        });

        describe('different structures', function(){

            function addGalleries(siteData, _pageId, shouldWrap){
                var desktopComp = factory.createStructure(galleryType1, {propertyQuery: 'p1'}, 'c1');
                var mobileComp = factory.createStructure(galleryType2, {propertyQuery: 'p1'}, 'c1');

                var mobileGallery = mobileComp;

                if (shouldWrap){
                    desktopComp = factory.createStructure('container', {components: [desktopComp]}, 'cont');
                    mobileComp = factory.createStructure('container', {components: [mobileComp]}, 'cont');
                }

                factory.addCompToPage(siteData, _pageId, desktopComp);
                factory.addCompToPage(siteData, _pageId, mobileComp, true);

                return mobileGallery;
            }

            it('should work for multiple galleries', function(){
                this.siteData.addPageWithDefaults(pageId);
                var mobileGallery1 = addGalleries(this.siteData, pageId, false);

                var desktopComp = factory.createStructure(galleryType3, {propertyQuery: 'p1'}, 'c2');
                var mobileGallery2 = factory.createStructure(galleryType2, {propertyQuery: 'p1'}, 'c2');

                factory.addCompToPage(this.siteData, pageId, desktopComp);
                factory.addCompToPage(this.siteData, pageId, mobileGallery2, true);

                var page = this.siteData.getPageData(pageId);

                galleriesMobileTypeFixer.exec(page);

                expect(mobileGallery1.componentType).toBe(galleryType1);
                expect(mobileGallery2.componentType).toBe(galleryType3);
            });

            it('should work on direct master children', function(){
                var mobileGallery = addGalleries(this.siteData, 'masterPage', false);
                var page = this.siteData.getPageData('masterPage');

                galleriesMobileTypeFixer.exec(page);

                expect(mobileGallery.componentType).toBe(galleryType1);
            });

            it('should work on indirect master children', function(){
                var mobileGallery = addGalleries(this.siteData, 'masterPage', true);
                var page = this.siteData.getPageData('masterPage');

                galleriesMobileTypeFixer.exec(page);

                expect(mobileGallery.componentType).toBe(galleryType1);
            });

            it('should work on page indirect children', function(){
                this.siteData.addPageWithDefaults(pageId);
                var mobileGallery = addGalleries(this.siteData, pageId, true);
                var page = this.siteData.getPageData(pageId);

                galleriesMobileTypeFixer.exec(page);

                expect(mobileGallery.componentType).toBe(galleryType1);
            });
        });

    });
});
