/**
 * Created by alexandreroitman on 30/05/2016.
 */
define(['core/components/siteAspects/RadioGroupsAspect'], function(RadioGroupsAspect) {
    "use strict";

    describe('Radio Groups Aspect', function(){

        beforeEach(function() {
            this.aspect = new RadioGroupsAspect();

            this.compId = 'comp1';
            this.groupName = 'group1';
        });

        it('should create new aspect', function() {
            expect(this.aspect).toBeDefined();
        });

        describe('register component to formGroup', function() {
            it('should add the component to a new form', function() {
                this.aspect.setRadioGroup(this.compId, this.groupName);

                expect(this.aspect.getRadioGroup(this.groupName).children).toContain(this.compId);
                expect(this.aspect.getRadioGroup(this.groupName).value).not.toBeDefined();
            });
        });

        describe('setRadioGroupValue', function(){
            it('should add the component to an existing form', function() {
                var comp2 = 'comp2';
                var comp2Value = 'val';
                this.aspect.setRadioGroup(this.compId, this.groupName);
                this.aspect.setRadioGroup(comp2, this.groupName);

                this.aspect.setRadioGroupValue(comp2, comp2Value);
                expect(this.aspect.getRadioGroup(this.groupName).children).toContain(this.compId);
                expect(this.aspect.getRadioGroup(this.groupName).children).toContain(comp2);
                expect(this.aspect.getRadioGroup(this.groupName).value).toBe(comp2Value);
            });
        });

        describe('removeRadioFromGroup', function() {
            beforeEach(function() {
                var comp2 = 'comp2';
                this.aspect.setRadioGroup(this.compId, this.groupName);
                this.aspect.setRadioGroup(comp2, this.groupName);
            });

            it('should remove the component from group', function() {
                this.aspect.removeRadioFromGroup('comp2');

                expect(this.aspect.getRadioGroup(this.groupName).children).not.toContain('comp2');
            });

            it('should set group value to undefined if the removed radio button is the selected one', function() {
                this.aspect.setRadioGroupValue('comp2', 'comp2Value');

                this.aspect.removeRadioFromGroup('comp2');
                expect(this.aspect.getRadioGroup(this.groupName).value).not.toBeDefined();
            });
        });
    });
});
