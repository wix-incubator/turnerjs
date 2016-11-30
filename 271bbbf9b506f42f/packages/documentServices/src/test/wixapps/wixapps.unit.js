define([
    'documentServices/wixapps/wixapps',
    'documentServices/wixapps/services/classics'
], function (wixapps, classics) {

    'use strict';


    describe('wixapps', function () {

        describe('methods.wixapps.classics', function () {

            describe('getTagNames', function () {

                it('should be classics.getTagNames', function () {
                    expect(wixapps.methods.wixapps.classics.getTagNames).toBe(classics.getTagNames);
                });

            });


            describe('reloadApp.dataManipulation', function () {

                it('should be classics.reloadApp', function () {
                    expect(wixapps.methods.wixapps.classics.reloadApp.dataManipulation).toBe(classics.reloadApp);
                });

            });

        });

    });

});