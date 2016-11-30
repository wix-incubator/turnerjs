/**
 * Created by amitk
 */
define(['lodash', 'coreUtils/core/urlUtils'], function (_, urlUtils) {
    'use strict';

    describe('urlUtils', function(){
        describe('parseUrl()', function () {
            it('editor style', function () {
                var url = 'http://editor.wix.com/html/editor/web/renderer/edit/d497d2a0-a2db-45c2-88e8-31b0fff73fee?metaSiteId=5152ee74-978e-4cf4-b26f-1c787b6516a1&editorSessionId=65CEC998-5BF8-48FB-B074-D79CB65A6E69';
                var parsed = urlUtils.parseUrl(url);
                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'editor.wix.com',
                    hostname: 'editor.wix.com',
                    port: '',
                    path: '/html/editor/web/renderer/edit/d497d2a0-a2db-45c2-88e8-31b0fff73fee',
                    search: '?metaSiteId=5152ee74-978e-4cf4-b26f-1c787b6516a1&editorSessionId=65CEC998-5BF8-48FB-B074-D79CB65A6E69',
                    query: {
                        metaSiteId: '5152ee74-978e-4cf4-b26f-1c787b6516a1',
                        editorSessionId: '65CEC998-5BF8-48FB-B074-D79CB65A6E69'
                    },
                    hash: ''
                });
            });

            it('url with params', function () {
                var url = 'http://www.412remodeling.com/?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0#!unknown/c1dng';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'www.412remodeling.com',
                    hostname: 'www.412remodeling.com',
                    port: '',
                    path: '/',
                    search: '?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0',
                    query: {
                        showMobileView: 'true',
                        petri_ovr: 'specs.RenderReact:true',
                        ReactSource: '1.10.0',
                        baseVersion: '1.10.0'
                    },
                    hash: '#!unknown/c1dng'
                });
            });

            it('url with params, no hash', function () {
                var url = 'http://www.412remodeling.com/?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'www.412remodeling.com',
                    hostname: 'www.412remodeling.com',
                    port: '',
                    path: '/',
                    search: '?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0',
                    query: {
                        showMobileView: 'true',
                        petri_ovr: 'specs.RenderReact:true',
                        ReactSource: '1.10.0',
                        baseVersion: '1.10.0'
                    },
                    hash: ''
                });
            });

            it('url with params, empty hash, and a port', function () {
                var url = 'http://www.412remodeling.com:8090/?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0#!';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'www.412remodeling.com:8090',
                    hostname: 'www.412remodeling.com',
                    port: '8090',
                    path: '/',
                    search: '?showMobileView=true&petri_ovr=specs.RenderReact%3Atrue&ReactSource=1.10.0&baseVersion=1.10.0',
                    query: {
                        showMobileView: 'true',
                        petri_ovr: 'specs.RenderReact:true',
                        ReactSource: '1.10.0',
                        baseVersion: '1.10.0'
                    },
                    hash: ''
                });
            });

            it('url with 2 params that are the same, and not path', function () {
                var url = 'http://www.412remodeling.com?a=1&b=2&a=3';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    hostname: 'www.412remodeling.com',
                    port: '',
                    host: 'www.412remodeling.com',
                    path: '/',
                    search: '?a=1&b=2&a=3',
                    query: {
                        a: ['1', '3'],
                        b: '2'
                    },
                    hash: ''
                });
            });

            it('url with 3 params that are the same, and not path', function () {
                var url = 'http://www.412remodeling.com?a=1&b=2&a=3&a=4';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'www.412remodeling.com',
                    hostname: 'www.412remodeling.com',
                    port: '',
                    path: '/',
                    search: '?a=1&b=2&a=3&a=4',
                    query: {
                        a: ['1', '3', '4'],
                        b: '2'
                    },
                    hash: ''
                });
            });

            it('url without protocol', function () {
                var url = 'www.412remodeling.com?a=1&b=2&a=3';
                var parsed = urlUtils.parseUrl(url);

                expect(parsed).toEqual({
                    full: url,
                    protocol: 'http:',
                    host: 'www.412remodeling.com',
                    hostname: 'www.412remodeling.com',
                    port: '',
                    path: '/',
                    search: '?a=1&b=2&a=3',
                    query: {
                        a: ['1', '3'],
                        b: '2'
                    },
                    hash: ''
                });
            });
        });

        describe('addProtocolIfMissing()', function() {
            it('with protocol', function() {
                var before = 'http://www.412remodeling.com?a=1&b=2&a=3';
                var after = urlUtils.addProtocolIfMissing(before);
                expect(after).toEqual(before);
            });

            it('with double slash', function() {
                var before = '//www.412remodeling.com?a=1&b=2&a=3';
                var after = urlUtils.addProtocolIfMissing(before);
                expect(after).toEqual('http:' + before);
            });

            it('with none', function() {
                var before = 'www.412remodeling.com?a=1&b=2&a=3';
                var after = urlUtils.addProtocolIfMissing(before);
                expect(after).toEqual('http://' + before);
            });
        });

        describe('baseUrl()', function() {
            it('with protocol', function() {
                var before = 'http://www.412remodeling.com?a=1&b=2&a=3';
                var after = urlUtils.baseUrl(before);
                expect(after).toEqual('http://www.412remodeling.com');
            });

            it('without protocol but with path', function() {
                var before = '//www.412remodeling.com/this/is/somepath.html?a=1&b=2&a=3';
                var after = urlUtils.baseUrl(before);
                expect(after).toEqual('http://www.412remodeling.com');
            });

            it('with no protocol and with port', function() {
                var before = 'www.412remodeling.com:8090/wekljr/?a=1&b=2&a=3';
                var after = urlUtils.baseUrl(before);
                expect(after).toEqual('http://www.412remodeling.com:8090');
            });
        });

        describe('toQueryString()', function () {
            it('empty', function () {
                var before = {};
                var after = urlUtils.toQueryString(before);
                expect(after).toEqual('');
            });
            it('one', function () {
                var before = {a: 1};
                var after = urlUtils.toQueryString(before);
                expect(after).toEqual('a=1');
            });
            it('many', function () {
                var before = {a: 1, 'some&thing': 2};
                var after = urlUtils.toQueryString(before);
                expect(after).toEqual('a=1&some%26thing=2');
            });
            it('multiple valuse', function () {
                var before = {a: 1, 'some&thing': 2, 'multi': ['a', 'b', 'c']};
                var after = urlUtils.toQueryString(before);
                expect(after).toEqual('a=1&multi=a&multi=b&multi=c&some%26thing=2');
            });
        });

        describe('toQueryParam()', function() {
            it('should create a uri encoded key only', function() {
                var result = urlUtils.toQueryParam('a');
                expect(result).toEqual('a');
                result = urlUtils.toQueryParam('a', null);
                expect(result).toEqual('a');
                result = urlUtils.toQueryParam('a', '');
                expect(result).toEqual('a');
            });
            it('should create a uri encoded query pair', function() {
                var result = urlUtils.toQueryParam('a&b', 'some&thing');
                expect(result).toEqual('a%26b=some%26thing');

                result = urlUtils.toQueryParam('a', 0);
                expect(result).toEqual('a=0');

                result = urlUtils.toQueryParam('a', false);
                expect(result).toEqual('a=false');
            });
            it('should split array into multiple pairs with same key', function() {
                var result = urlUtils.toQueryParam('mul&ti', ['a', 'b', 'c&d']);
                expect(result).toEqual('mul%26ti=a&mul%26ti=b&mul%26ti=c%26d');
            });
        });

        describe('cacheKiller()', function() {
            it('without reset', function() {
                urlUtils.resetCacheKiller();
                var results = [];
                var result = urlUtils.cacheKiller();
                expect(result.charAt(result.length - 1)).toEqual('0');
                results.push(result);

                result = urlUtils.cacheKiller();
                expect(result.charAt(result.length - 1)).toEqual('1');
                results.push(result);

                expect(_.uniq(results).length).toEqual(2);
            });

            it('with reset', function() {
                urlUtils.resetCacheKiller();
                urlUtils.cacheKiller();
                urlUtils.cacheKiller();
                urlUtils.cacheKiller();
                var result = urlUtils.cacheKiller();
                expect(result.charAt(result.length - 1)).toEqual('3');

                urlUtils.resetCacheKiller();
                result = urlUtils.cacheKiller();
                expect(result.charAt(result.length - 1)).toEqual('0');
            });
        });

        describe('setUrlParam()', function() {
            it('should add a parameter', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toEqual(paramValue);
            });

            it('should add a parameter in url with 2 Question Marks', function() {
                var param = 'd';
                var paramValue = 'dalet';
                var url = 'https://gaga.com/lala?url=http://haha.com&auto_play=false?';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                expect(newUrl).toEqual('https://gaga.com/lala?url=http://haha.com&auto_play=false&d=dalet?');
            });

            it('should add 2 parameters in url with 2 Question Marks', function() {
                var url = 'https://gaga.com/lala?url=haha.com&auto_play=false?';
                var newUrl = urlUtils.setUrlParam(url, 'd', 'dalet');
                newUrl = urlUtils.setUrlParam(newUrl, 'auto_play', 'true');
                expect(newUrl).toEqual('https://gaga.com/lala?url=haha.com&auto_play=true&d=dalet?');
            });

            it('should change a parameter (version 1)', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel&d=unicorn';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toEqual(paramValue);
            });

            it('should change a parameter (version 2)', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn?d=unicorn';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toEqual(paramValue);
            });

            it('should change a parameter (version 3)', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&d=unicorn&c=gimel';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toEqual(paramValue);
            });

            it('should set a parameter (version 2)', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toEqual(paramValue);
            });

            it('should set a parameter with multiple instances', function() {
                var param = 'd',
                    paramValue = 'dalet';
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&d=unicorn&c=gimel&d=yalla&d=hapoel&d=milhama';
                var newUrl = urlUtils.setUrlParam(url, param, paramValue);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);
                expect(parsedNewUrl.query[param]).toContain(paramValue);
            });
        });

        describe('setUrlParams()', function() {
            it('should add a parameters', function() {
                var params = {
                    'param1': 'value1',
                    'param2': 'value2'
                };

                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel';
                var newUrl = urlUtils.setUrlParams(url, params);
                var parsedNewUrl = urlUtils.parseUrl(newUrl);

                expect(parsedNewUrl.query.param1).toEqual(params.param1);
                expect(parsedNewUrl.query.param2).toEqual(params.param2);
            });

            it('should return the same URL', function() {
                var params = {};

                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel';
                var newUrl = urlUtils.setUrlParams(url, params);

                expect(newUrl).toEqual(url);
            });
        });

        describe('removeUrlParam()', function () {
            it('should remove the parameter from the url', function () {
                var url = 'http://www.wix.com/?first=true&second=3';
                var expectedUrl = 'http://www.wix.com/?second=3';
                var result = urlUtils.removeUrlParam(url, 'first');

                expect(result).toEqual(expectedUrl);
            });

            it("should return the same url if the parameter doesn't exist", function () {
                var url = 'http://www.wix.com/?first=true&second=3';
                var result = urlUtils.removeUrlParam(url, "don'tExist");

                expect(result).toEqual(url);
            });

            it('should return the same url if the url does not contains any search part', function () {
                var url = 'http://www.wix.com/';
                var result = urlUtils.removeUrlParam(url, 'any');

                expect(result).toEqual(url);
            });

            it('should remove all appearances of the parameter from the url', function () {
                var url = 'http://www.wix.com/?first=true&second=3&first=false';
                var expectedUrl = 'http://www.wix.com/?second=3';
                var result = urlUtils.removeUrlParam(url, 'first');

                expect(result).toEqual(expectedUrl);
            });
        });

        describe('buildFullUrl()', function() {
            it('should build URL correctly', function() {
                var url = 'https://github.com/state';
                var parsedUrl = urlUtils.parseUrl(url);

                parsedUrl.query = {
                    a: 1,
                    b: 2
                };

                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual('https://github.com/state?a=1&b=2');
            });

            it('should build URL with query correctly', function() {
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel';
                var parsedUrl = urlUtils.parseUrl(url);

                parsedUrl.query.d = 'dalet';

                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual(url);
            });

            it('should build URL with search string correctly', function() {
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel';
                var parsedUrl = urlUtils.parseUrl(url);

                parsedUrl.search += '&d=dalet';

                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual('https://github.com/wix/unicorn?a=alef&b=bet&c=gimel&d=dalet');
            });

            it('should build URL with query and hash correctly', function() {
                var url = 'https://github.com/wix/unicorn?a=alef&b=bet&c=gimel#!masterPage/ct1b3/state';
                var parsedUrl = urlUtils.parseUrl(url);
                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual(url);
            });

            it('should build URL with port correctly', function() {
                var url = 'https://github.com:8080/wix/unicorn?a=alef&b=bet&c=gimel#!masterPage/ct1b3/state';
                var parsedUrl = urlUtils.parseUrl(url);
                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual(url);
            });

            it('should handle query params in path', function() {
                var url = 'https://github.com:8080/wix/unicorn?a=alef&b=bet&c=gimel#!masterPage/ct1b3/state';
                var parsedUrl = urlUtils.parseUrl(url);

                parsedUrl.path += '?z=zed';

                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);
                var desiredUrl = 'https://github.com:8080/wix/unicorn?z=zed&a=alef&b=bet&c=gimel#!masterPage/ct1b3/state';

                expect(reBuiltUrl).toEqual(desiredUrl);
            });

            it('should build blob URL correctly', function() {
                var url = 'blob:http%3A//editor.wix.com/42b75160-776a-44fc-a8ce-b03f7e1d7409';
                var parsedUrl = urlUtils.parseUrl(url);

                //query params should be ignored in blob
                parsedUrl.query = {
                    a: 1,
                    b: 2
                };

                var reBuiltUrl = urlUtils.buildFullUrl(parsedUrl);

                expect(reBuiltUrl).toEqual(url);
            });
        });

        describe('joinURL()', function() {
            it('should return the same value if given one argument', function () {
                var url = 'http://github.com';
                expect(urlUtils.joinURL(url)).toBe(url);
            });

            it('should work for multiple arguments', function() {
                var fragments = ['http://github.com', 'wix', 'santa'];
                expect(urlUtils.joinURL.apply(null, fragments)).toBe(fragments.join('/'));
            });

            it('should keep only one slash between arguments', function() {
                var fragments = ['http://github.com', 'wix', 'santa'];
                var extraSlashes = ['http://github.com/', '/wix/', '/santa'];
                expect(urlUtils.joinURL.apply(null, extraSlashes)).toBe(fragments.join('/'));
            });
        });

        describe('isQueryParamOn', function(){
            function isParamOn(url, name) {
                var parsedUrl = urlUtils.parseUrl(url);
                return urlUtils.isQueryParamOn(parsedUrl, name);
            }

            it('should return true if param is true', function() {
                expect(isParamOn('http://some-skitty-url.com/?hideMobileActionBar=true&debug=somePackage', 'hideMobileActionBar')).toBeTruthy();
            });

            it('should return false if param is false', function() {
                expect(isParamOn('http://some-skitty-url.com/?hideMobileActionBar=false', 'hideMobileActionBar')).toBeFalsy();
            });
        });

        describe('isExternalUrl', function(){
            it('should return true if url starts with http', function() {
                expect(urlUtils.isExternalUrl('http://some-skitty-url.com/')).toBeTruthy();
            });

            it('should return true if url starts with https', function() {
                expect(urlUtils.isExternalUrl('https://some-skitty-url.com/')).toBeTruthy();
            });

            it('should return true if url starts with blob', function() {
                expect(urlUtils.isExternalUrl('blob:http%3A//editor.wix.com/42b75160-776a-44fc-a8ce-b03f7e1d7409')).toBeTruthy();
            });

            it('should return true if url starts with //', function() {
                expect(urlUtils.isExternalUrl('//img.youtube.com/vi/CakiQCH5ZY0/0.jpg')).toBeTruthy();
            });

            it('should return false if url has none of the above', function() {
                expect(urlUtils.isExternalUrl('139571a1212e4d3d8074041626ba3ed6.jpg/v1/fill/w_216,h_154,al_c,q_80,usm_0.66_1.00_0.01/139571a1212e4d3d8074041626ba3ed6.jpg')).toBeFalsy();
            });
        });

        describe('getParameterByName', function () {
            it('should return param value', function () {
                var p = urlUtils.getParameterByName('debug', '?hideMobileActionBar=true&debug=somePackage');
                expect(p).toEqual('somePackage');
            });

            it('should return empty for invalid', function () {
                var p = urlUtils.getParameterByName('invalid', '?hideMobileActionBar=true&debug=somePackage');
                expect(p).toEqual('');
            });

            it('should return empty for empty string', function () {
                var p = urlUtils.getParameterByName('invalid', '');
                expect(p).toEqual('');
            });

            it('should return empty for no params', function () {
                var p = urlUtils.getParameterByName('invalid', '?');
                expect(p).toEqual('');
            });
        });

        describe('isTrue', function () {
            it('should return true if param is true', function () {
                expect(urlUtils.isTrue('hideMobileActionBar', '?hideMobileActionBar=true&debug=somePackage')).toBeTruthy();
            });

            it('should return false if param is false', function () {
                expect(urlUtils.isTrue('hideMobileActionBar', '?hideMobileActionBar=false')).toBeFalsy();
            });
        });
    });
});
