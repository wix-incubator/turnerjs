/**
 * Created by eitanr on 3/24/15.
 */
define(['utils/media/media'], function (mediaUtils) {
    'use strict';

    describe('mediaUtils', function () {
        describe('getMediaUrl', function () {
            var mediaRelativeUrl = 'path/to/file.png';
            var mockServiceTopology = {scriptsDomainUrl: 'http://scripts.domain.url'};

            it('Should return the right url', function () {
                var result = mediaUtils.getMediaUrl(mockServiceTopology, mediaRelativeUrl);
                expect(result).toEqual('http://scripts.domain.url/services/santa-resources/resources/viewer/path/to/file.png');
            });

            it('Should return the latin css url', function () {
                var result = mediaUtils.getMediaUrl({scriptsDomainUrl: 'http://static.parastorage.com/'}, 'user-site-fonts/v1/latin.css');
                expect(result).toEqual('http://static.parastorage.com/services/santa-resources/resources/viewer/user-site-fonts/v1/latin.css');
            });

            it('should return a string', function () {
                var result = mediaUtils.getMediaUrl(mockServiceTopology, mediaRelativeUrl);
                expect(typeof result).toEqual('string');
            });

            it('should return a valid url', function () {
                var result = mediaUtils.getMediaUrl(mockServiceTopology, mediaRelativeUrl);

                expect(result).toBeValidUrl();
            });

            it('should ignore a slash at the beginning of the file url', function () {
                var relativeUrlWithPrefixSlash = '/' + mediaRelativeUrl;

                var result1 = mediaUtils.getMediaUrl(mockServiceTopology, relativeUrlWithPrefixSlash);
                var result2 = mediaUtils.getMediaUrl(mockServiceTopology, mediaRelativeUrl);

                expect(result1).toEqual(result2);
            });
        });
    });
});
