define([
    'wixappsClassics/util/numberOfPostsPerPageGetter'
], function (
    numberOfPostsPerPageGetter
) {
    'use strict';

    describe('numberOfPostsPerPageGetter', function () {

        beforeEach(function () {
            this.givenCompDataExpectNumberOfPostsPerPage = function (compData, expectedNumberOfPostsPerPage, format, defaultValue) {
                var actualNumberOfPostsPerPage = numberOfPostsPerPageGetter.getNumberOfPostsPerPage(compData, format, defaultValue);
                expect(actualNumberOfPostsPerPage).toEqual(expectedNumberOfPostsPerPage);
            };
        });

        it('should return value of itemsPerPage variable from customizations', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 9,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 9);

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 11,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 11);
        });

        it('should return value of itemsPerPage variable from customizations by format', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: 'Mobile',
                    value: 9,
                    view: 'ViewName'
                },
                {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: '*',
                    value: 10,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 10, '*');

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: 'Mobile',
                    value: 9,
                    view: 'ViewName'
                },
                {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: '',
                    value: 10,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 10, '');

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: 'Mobile',
                    value: 9,
                    view: 'ViewName'
                },
                {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    format: '',
                    value: 10,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 9, 'Mobile');
        });

        it('should return value of the customization only for current view name', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'AnotherViewName'
                }, {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 2);

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'AnotherViewName'
                }],
                viewName: 'ViewName'
            }, 1);

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'AnotherViewName'
                }],
                viewName: 'AnotherViewName'
            }, 2);
        });

        it('should return value of the customization only for key "itemsPerPage"', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'otherKey',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 2);

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'vars',
                    key: 'otherKey',
                    value: 2,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 1);
        });

        it('should return value of the customization only for field ID "vars"', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'otherFieldId',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 2);

            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [{
                    fieldId: 'vars',
                    key: 'itemsPerPage',
                    value: 1,
                    view: 'ViewName'
                }, {
                    fieldId: 'otherFieldId',
                    key: 'itemsPerPage',
                    value: 2,
                    view: 'ViewName'
                }],
                viewName: 'ViewName'
            }, 1);
        });

        it('should return 10 if there is no the customization', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [],
                viewName: 'ViewName'
            }, 10);
        });

        it('should return default value if there is no the customization and default value and default value passed', function () {
            this.givenCompDataExpectNumberOfPostsPerPage({
                appLogicCustomizations: [],
                viewName: 'ViewName'
            }, 5, undefined, 5);
        });
    });
});
