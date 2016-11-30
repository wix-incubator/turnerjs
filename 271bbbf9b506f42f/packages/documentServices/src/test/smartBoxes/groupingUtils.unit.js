define([
    'lodash',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/constants/constants',
        'documentServices/anchors/anchors',
        'packages/documentServices/src/test/smartBoxes/groupingUtils.json.js'
    ],
    function(_, groupingUtils, privateServicesHelper, constants, anchors, pageWithGroupOfGalleryAndButton){
        'use strict';

        describe('groupingUtils spec', function(){
            var ps;
            var pagesDataPointer;

            function getCompPointer(privateServices, compId, pageId){
                var page = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return privateServices.pointers.components.getComponent(compId, page);
            }

            beforeEach(function(){
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                spyOn(anchors, 'updateAnchors');
            });

            describe('isGroup & isGroupedComponent', function(){

                var buttonId, groupId, pageId, groupPointer, buttonPointer;

                beforeEach(function(){

                    pageId = 'c1dmp';
                    buttonId = 'i7lqfbtj';
                    groupId = 'comp-i7vt2kjz';
                    pagesDataPointer = ps.pointers.general.getPagesData();
                    ps.dal.set(pagesDataPointer, pageWithGroupOfGalleryAndButton);

                    buttonPointer = getCompPointer(ps, buttonId, pageId);
                    groupPointer = getCompPointer(ps, groupId, pageId);
                });

                it('should return true on group comp', function(){
                    expect(groupingUtils.isGroup(ps, groupPointer)).toBeTruthy();
                });

                it('should return false on non group comp', function(){
                    expect(groupingUtils.isGroup(ps, buttonPointer)).toBeFalsy();
                });

                it('should return true on grouped comp', function(){
                    expect(groupingUtils.isGroupedComponent(ps, buttonPointer)).toBeTruthy();
                });

                it('should return false on non grouped comp', function(){
                    expect(groupingUtils.isGroupedComponent(ps, groupPointer)).toBeFalsy();
                });



            }); // describe isGroup

    });
});
