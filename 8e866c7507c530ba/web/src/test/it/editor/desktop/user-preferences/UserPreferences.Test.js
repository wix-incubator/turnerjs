describe("UserPreferences:", function () {
    var host = window.location.host;
    var editorPrefsBaseUrl = 'http://'+host+'/_api/wix-user-preferences-webapp/',
        getBlobs = editorPrefsBaseUrl + 'getVolatilePrefs/',
        getSingleBlobForKey = editorPrefsBaseUrl + 'getVolatilePrefForKey/',
        getSingleBlobForSite = editorPrefsBaseUrl + 'getVolatilePrefForSite/',
        getBlobsForSite = editorPrefsBaseUrl + 'getVolatilePrefsForSite/',
        postSet = editorPrefsBaseUrl + 'set/',
        postBulkset = editorPrefsBaseUrl + 'bulkSet/';

    var data, success, callbacks, urlParams, siteId, restClient, responseData;

    beforeAll(function(){
        W.Classes.getClass('core.managers.serverfacade.RESTClient', function(RestClient){
            restClient = new RestClient();
        });
        waitsFor(function () {
            return !!restClient;
        }, 'could not get the restClient in time', 2000);
    });
    beforeEach(function(){
        data = null;
        success = null;
        urlParams = null;
        responseData = null;
        siteId = window.editorModel.siteHeader.id;
        callbacks = {
            "onSuccess": function(res){
                if(_.isEmpty(res)){
                    success = false;
                }
                else{
                    responseData = res;
                    success = true;
                }
            },
            "onComplete": function(){
                success = true;
            },
            "onError": function(){
                success = false;
                responseData = {};
            }
        };
    });
    describe("The set API", function () {
        it("should successfully save the blob data based on the key", function () {
            data = {
                "nameSpace":"htmlEditor",
                "key":"sample_key",
                "blob": {
                    "blob1": "some data (blob1)",
                    "blob2": "some more data (blob2)"
                }
            };

            restClient.post(postSet, data, callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });

        it("should successfully save the blob data for a key and TTL", function () {
            data = {
                "nameSpace":"htmlEditor",
                "key":"sample_key_2",
                "blob": {
                    "blob1": "some data (blob1)",
                    "blob2": "some more data (blob2)"
                },
                "TTLInDays": 1
            };

            restClient.post(postSet, data, callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });

        it("should successfully save the blob data based on the key and siteId", function () {

            data = {
                "siteId": siteId,
                "nameSpace":"htmlEditor",
                "key":"sample_key_with_siteid",
                "blob": {
                    "blob1": "some data (blob1)",
                    "blob2": "some more data (blob2)"
                }
            };

            restClient.post(postSet,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });
    });

    describe("The getVolatilePrefForKey API", function () {
        it("should return a single blob saved for a specific key for the user", function () {

            urlParams = 'htmlEditor/' + "sample_key";

            restClient.get(getSingleBlobForKey+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });

        it("should return the data that was saved", function () {

            var savedBlob = {
                "blob1": "some data (blob1)",
                "blob2": "some more data (blob2)"
            }, key = "sample_key";
            urlParams = 'htmlEditor/' + key;

            restClient.get(getSingleBlobForKey+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                var savedData = {};
                savedData[key] = savedBlob;
                expect(_.isEqual(savedData, responseData)).toBeTruthy();
            });
        });

       /* it("should return the TTL that was saved", function () {

            var key = "sample_key_2";

            urlParams = 'htmlEditor/' + key;

            restClient.get(getSingleBlobForKey+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(responseData.TTLInDays).toEqual(1);
            });
        });*/
    });

    describe("The bulkSet API", function () {
        it("should successfully save multiple key-blob pairs", function () {
            data = {
                "nameSpace":"htmlEditor",
                "data":{
                    "key1": {
                        "blob1a": "some data (blob1a)",
                        "blob1b": "some more data (blob1b)"
                    },
                    "key2": {
                        "blob2a": "some data (blob2a)",
                        "blob2b": "some more data (blob2b)"
                    }
                }
            };

            restClient.post(postBulkset,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });

        it("should successfully save multiple key-blob pairs with a specific siteId", function () {
            data = {
                "nameSpace":"htmlEditor",
                "siteId": siteId,
                "data":{
                    "key1": {
                        "blob1a": "some data (blob1a)",
                        "blob1b": "some more data (blob1b)"
                    },
                    "key2": {
                        "blob2a": "some data (blob2a)",
                        "blob2b": "some more data (blob2b)"
                    }
                }
            };

            restClient.post(postBulkset,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });
    });

    describe("The getVolatilePrefs API", function () {
        it("should return all previously saved blobs for a namespace for the user", function () {

            urlParams = 'htmlEditor';

            restClient.get(getBlobs+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });
    });
    describe("The getVolatilePrefsForSite (plural) API", function () {
        it("should return all previously saved blobs for a namespace with a specific siteId", function () {

            urlParams = 'htmlEditor/'+siteId;

            restClient.get(getBlobsForSite+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });
    });


    describe("The getVolatilePrefForSite (singular) API", function () {
        it("should return a saved blob by key and namespace for a specific site", function () {

            urlParams = 'htmlEditor/' + siteId + '/sample_key_with_siteid';

            restClient.get(getSingleBlobForSite+urlParams,data,callbacks);

            waitsFor(function () {
                return success !==  null;
            }, 'the request did not complete in time', 2000);

            runs(function () {
                expect(success).toBeTruthy();
            });
        });
    });
});
