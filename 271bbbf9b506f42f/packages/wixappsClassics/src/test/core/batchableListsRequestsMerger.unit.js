define([
    'wixappsClassics/core/batchableListsRequestsMerger',
    'lodash',
    'testUtils',
    'wixappsClassics/core/timeout'
], function (
    batchableListsRequestsMerger,
    _,
    testUtils,
    TIMEOUT
) {
    'use strict';

    describe('batchableListsRequestsMerger', function () {
        it('should merge batchable lists requests into a single batch request', function () {
            var requests = Object.freeze([{
                destination: ['wixapps', 'foo'],
                url: 'http://editor.wix.com/apps/lists/1/GroupByAndCount?consistentRead=false',
                data: {foo: 'bar'},
                transformFunc: function (responseData, currentValue) {
                    return [currentValue, 'bar', responseData.payload];
                }
            }, {
                destination: ['wixapps', 'bar'],
                url: 'http://editor.wix.com/apps/lists/1/Query?consistentRead=false',
                data: {bar: 'baz'},
                transformFunc: function (responseData, currentValue) {
                    return [currentValue, 'baz', responseData.payload];
                }
            }, {
                destination: ['wixapps', 'baz'],
                url: 'http://editor.wix.com/apps/lists/1/ReadItem?consistentRead=false',
                data: {baz: 'qux'},
                transformFunc: function (responseData, currentValue) {
                    return [currentValue, 'qux', responseData.payload];
                }
            }]);

            var siteData = testUtils.mockFactory.mockSiteData();
            spyOn(siteData, 'getExternalBaseUrl').and.returnValue('http://example.com/foo/bar/baz');
            var mergedRequests = batchableListsRequestsMerger.mergeBatchableListsRequestsIfAny(siteData, requests);

            expect(mergedRequests).toEqual([
                jasmine.objectContaining({
                    destination: ['wixapps'],
                    url: 'http://example.com/apps/lists/1/Batch?consistentRead=false',
                    data: {
                        operations: [{
                            name: 'GroupByAndCount',
                            params: {foo: 'bar'}
                        }, {
                            name: 'Query',
                            params: {bar: 'baz'}
                        }, {
                            name: 'ReadItem',
                            params: {baz: 'qux'}
                        }]
                    },
                    force: true,
                    timeout: TIMEOUT
                })
            ]);

            var currentValue = {
                foo: 'foo',
                bar: 'bar',
                baz: 'baz'
            };
            var responseData = {
                payload: {
                    results: [{
                        payload: 'abc'
                    }, {
                        payload: 'def'
                    }, {
                        payload: 'ghi'
                    }]
                }
            };
            var batchRequest = _.first(mergedRequests);
            batchRequest.transformFunc(responseData, currentValue);
            expect(currentValue).toEqual({
                foo: ['foo', 'bar', 'abc'],
                bar: ['bar', 'baz', 'def'],
                baz: ['baz', 'qux', 'ghi']
            });
        });

        it('should do nothing if there are no batchable requests', function () {
            var siteData = testUtils.mockFactory.mockSiteData();
            var requests = Object.freeze([{foo: 'bar'}]);
            var mergedRequests = batchableListsRequestsMerger.mergeBatchableListsRequestsIfAny(siteData, requests);

            expect(mergedRequests).toEqual(requests);
            expect(mergedRequests).not.toBe(requests);
        });
    });
});
