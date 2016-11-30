define(['wixappsCore/util/viewsUtils'], function(viewsUtils){
    'use strict';

    describe('viewsUtils', function(){

        describe('getViewId', function() {

            it('should return an ID without a format', function() {
                var viewId = viewsUtils.getViewId('type', 'name');
                expect(viewId).toEqual('type|name');
            });

            it('should return an ID with a format', function() {
                var viewId = viewsUtils.getViewId('type', 'name', 'format');
                expect(viewId).toEqual('type|name|format');
            });

            it('should ignore extra arguments', function() {
                var viewId = viewsUtils.getViewId('type', 'name', 'format', 'extra');
                expect(viewId).toEqual('type|name|format');
            });

        });

        describe('getViewNameFromId', function() {

            it('should return view name from an id with a format', function() {
                var viewName = viewsUtils.getViewNameFromId('type|name|format');
                expect(viewName).toEqual('name');
            });

            it('should return view name from an id without a format', function() {
                var viewName = viewsUtils.getViewNameFromId('type|name');
                expect(viewName).toEqual('name');
            });

            it('should return null when not given a view id', function() {
                var viewName = viewsUtils.getViewNameFromId('not a view id');
                expect(viewName).toBeNull();

                viewName = viewsUtils.getViewNameFromId('|not a view id');
                expect(viewName).toBeNull();

                viewName = viewsUtils.getViewNameFromId('not a view id|');
                expect(viewName).toBeNull();
            });

        });

    });
});