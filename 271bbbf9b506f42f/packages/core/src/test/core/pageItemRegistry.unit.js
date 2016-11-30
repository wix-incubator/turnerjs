define(['core/core/pageItemRegistry'], function(/** core.pageItemRegistry */ pageItemRegistry){
    'use strict';
    describe("pageItemRegistry", function(){
        beforeEach(function () {
            spyOn(console, "error");
        });

        it("should return null of type isn't registered", function () {
            var structure = pageItemRegistry.getCompStructure('Type', 'ItemId');
            expect(structure).toBeNull();
        });
        it("should return the structure with correct data id", function(){
            pageItemRegistry.registerPageItem('Type', function(id){
                return 'structure ' + id;
            });
            var structure = pageItemRegistry.getCompStructure('Type', 'aa');
            expect(structure).toBe('structure aa');
        });
        it("should not override a registered type", function(){
            pageItemRegistry.registerPageItem('Type2', function(){ return 1;});
            pageItemRegistry.registerPageItem('Type2', function(){ return 2; });

            expect(pageItemRegistry.getCompStructure('Type2', 'a')).toBe(1);
        });

    });
});
