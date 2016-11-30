/**
 * Created by Dan_Shappir on 11/3/14.
 */
define(['lodash', 'siteUtils/core/socialCounterDatabaseAPI', 'coreUtils'], function (_, socialCounterDatabaseAPI, coreUtils) {
    'use strict';

    xdescribe('toggleUserLike', function () {
        var fakeStorage = '{}';
        var postId = 'abcde';
        var localStorage = window.localStorage;
        beforeAll(function () {
            spyOn(localStorage, 'getItem').and.callFake(function () {
                return fakeStorage;
            });
            spyOn(localStorage, 'setItem').and.callFake(function (index, value) {
                fakeStorage = value;
            });
        });

        it('should mark post as liked if no state is saved for the post', function () {
            expect(JSON.parse(fakeStorage)[postId]).toEqual(undefined);
            socialCounterDatabaseAPI.toggleUserLike(postId);
            expect(JSON.parse(fakeStorage)[postId]).toEqual(true);
        });

        it('should mark post as unliked after toggleLike of liked post', function () {
            expect(JSON.parse(fakeStorage)[postId]).toEqual(true);
            socialCounterDatabaseAPI.toggleUserLike(postId);
            expect(JSON.parse(fakeStorage)[postId]).toEqual(false);
        });

        it('should mark post as liked after toggleLike of unliked post', function () {
            expect(JSON.parse(fakeStorage)[postId]).toEqual(false);
            socialCounterDatabaseAPI.toggleUserLike(postId);
            expect(JSON.parse(fakeStorage)[postId]).toEqual(true);
        });

    });

    xdescribe('getAllCountersForPost and updateCounter', function () {

        function ajaxMock (ajaxInfo) {
            var postId = ajaxInfo.data.postId;
            if (_.includes(ajaxInfo.url, 'query')) {
                actual = JSON.parse(fakeStorageString)[postId];
                return;
            }
            var storage = JSON.parse(fakeStorageString);
            var service = ajaxInfo.data.service;
            if (service === 'unlike') {
                storage[postId].like--;
            } else {
                storage[postId][service]++;
            }
            fakeStorageString = JSON.stringify(storage);
        }

        var fakeStorage = {
            aaa: {
                like: 18,
                share_google: 4,
                share_facebook: 9,
                share_twitter: 0,
                share_pinterest: 0,
                share_fancy: 0,
                share_whatsapp: 5
            },

            bbb: {
                like: 10,
                share_google: 15,
                share_facebook: 12,
                share_twitter: 3,
                share_pinterest: 7,
                share_fancy: 19,
                share_whatsapp: 11
            }
        };

        var actual;

        var fakeStorageString = JSON.stringify(fakeStorage);

        beforeAll(function () {
            spyOn(coreUtils.ajaxLibrary, 'ajax').and.callFake(ajaxMock);
        });

        it('should return social counters of a given postId', function () {
            actual = socialCounterDatabaseAPI.getAllCountersForPost('aaa');
            expect(actual).toEqual(fakeStorage.aaa);
        });

        it('should update a share counter of a given post with +1', function () {
            var serviceCounter = 'share_facebook';
            socialCounterDatabaseAPI.getAllCountersForPost('aaa');
            expect(actual[serviceCounter]).toEqual(9);
            socialCounterDatabaseAPI.updateCounter('facebook', 'aaa');
            socialCounterDatabaseAPI.getAllCountersForPost('aaa');
            expect(actual[serviceCounter]).toEqual(10);
        });

        it('should update a share like counter with +1 for like', function () {
            var serviceCounter = 'like';
            socialCounterDatabaseAPI.getAllCountersForPost('aaa');
            expect(actual[serviceCounter]).toEqual(18);
            socialCounterDatabaseAPI.updateCounter('like', 'aaa');
            socialCounterDatabaseAPI.getAllCountersForPost('aaa');
            expect(actual[serviceCounter]).toEqual(19);
        });

        it('should update a share like counter with -1 for unlike', function () {
            var serviceCounter = 'like';
            socialCounterDatabaseAPI.getAllCountersForPost('bbb');
            expect(actual[serviceCounter]).toEqual(10);
            socialCounterDatabaseAPI.updateCounter('unlike', 'bbb');
            socialCounterDatabaseAPI.getAllCountersForPost('bbb');
            expect(actual[serviceCounter]).toEqual(9);
        });

    });

});

