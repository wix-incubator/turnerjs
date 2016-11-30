describe("UserPreferencesHandler", function () {

    var UPH, done, success, overrideCallbacks, userPrefData, responseData;

    beforeAll(function(){
        UPH = W.Editor.userPreferencesHandler;
        waitsFor(function(){
            return UPH.isDataReady();
        },'The user preferences handler did not load any data yet', 3000);
    });

    describe("UserPreferences:", function () {

        beforeEach(function(){
            done = false;
            success = undefined;
            responseData = null;
            UPH._userPrefData ={data:{}, global_preferences: {}, "nameSpace": "htmlEditor",
                "siteId" : window.editorModel.siteHeader.id};
            overrideCallbacks = {
                "onComplete": function(){done = true;}
            };
            userPrefData = {
                "pageId1": {
                    rulers: {v: {desktop: [0, 10, 110], mobile: [20,220,2220] }, h:{desktop:[1, 11, 111], mobile:[21, 221, 2221]}},
                    lockedComponents: {
                        "comp1": 1,
                        "comp2": 1,
                        "WRchTxt32": 1
                    }
                },
                "pageId2":{
                    rulers: {v: {desktop: [12, 112, 1112], mobile: [22,222,2222] }, h:{desktop:[13, 113, 1113], mobile:[23, 223, 2223]}},
                    lockedComponents: {
                        "comp1": 1,
                        "comp2": 1,
                        "WRchTxt32": 1
                    }
                }
            };
        });

        afterEach(function(){
            done = false;
            success = undefined;
            responseData = null;
            UPH._userPrefData ={data:{}, global_preferences: {}, "nameSpace": "htmlEditor",
                "siteId" : window.editorModel.siteHeader.id};
            overrideCallbacks = {
                "onComplete": function(){done = true;}
            };
            userPrefData = {
            };
        });

        describe("Saving data", function () {
            it("should successfully save all dirty key-value blobs stored in the userPreferencesHandler.", function () {
                runs(function(){
                    UPH.setData({key: 'pageId1'}, userPrefData.pageId1);
                    UPH.setData({key: 'pageId2'}, userPrefData.pageId2);

                    overrideCallbacks.onSuccess = function(data){
                        responseData = data;
                        success = true;
                    };
                    overrideCallbacks.onError = function(){
                        success = false;
                    };
                });
                runs(function(){
                    UPH._saveUserPrefsForSite(overrideCallbacks);
                });
                waitsFor(function () {
                    return done && typeof success !== 'undefined';
                }, 'the request did not complete in time', 3000);

                runs(function () {
                    expect(success).toBeTruthy();
                    expect(_.isEqual(UPH._userPrefData.data, responseData)).toBeTruthy();
                });
            });
        });

        describe("The load all user preferences request", function () {
            it("should successfully get the preferences for the site", function () {
                UPH._userPrefData.data = userPrefData;
                runs(function(){
                    overrideCallbacks.onSuccess = function(data){
                        responseData = data;
                        success = true;
                    };
                    overrideCallbacks.onError = function(){
                        success = false;
                    };
                });

                runs(function(){
                    UPH._loadUserPrefsForSite(overrideCallbacks);
                });

                waitsFor(function(){
                    return done && typeof success !== 'undefined';
                }, 'the request did not complete in time', 3000);

                runs(function () {
                    //note that we're testing vs success, and not vs the loaded data,
                    // since there is no guarantee that there will be data saved on the server
                    expect(success).toBeTruthy();
                    //though we can test to make sure responseData is at least an empty object, and not null
                    expect(responseData).toBeTruthy();
                });
            });
        });

        describe("Trying to fetch data by path", function(){
            it("should return the requested data if it exists",function(){
                var path = "rulers.v",
                    options = {key: 'pageId2'};
                UPH._userPrefData.data = userPrefData;
                runs(function(){
                    UPH.getData(path,options).then(function(data){
                        responseData = data;
                        done = true;
                    });
                });

                waitsFor(function(){
                    return done;
                },'could not retrieve the data from the UserPreferencesHandler in time', 2000);

                runs(function(){
                    expect(responseData).toEqual({desktop: [12, 112, 1112], mobile: [22,222,2222] });
                });
            });

            it("should return an empty object if it does not exist",function(){
                var path = "rulers.v",
                    options = {key: 'pageId2'},
                    loadedData;
                runs(function(){
                    UPH._userPrefData.data = {};
                });


                runs(function(){
                    UPH.getData(path,options).then(function(data){
                        loadedData = data;
                        done = true;
                    });
                });

                waitsFor(function(){
                    return done;
                },'could not retrieve the data from the UserPreferencesHandler in time', 3000);

                runs(function(){
                    expect(loadedData).toEqual({});
                });
            });
        });

        describe("Trying to set data for a path",function(){
            it("should override the existing data at that specific path if data already exists",function(){
                var path = "rulers.v",
                    options = {key: 'pageId2'},
                    dataToSave = {desktop: [1], mobile: [0,0]};
                runs(function(){
                    UPH._userPrefData.data = userPrefData;
                });

                runs(function(){
                    UPH.setData(path,dataToSave,options);
                });

                runs(function(){
                    expect(UPH._userPrefData.data.pageId2.rulers.v).toEqual(dataToSave);
                });

            });
            it("create a deep-object according to the path and save the data, if such a path does not exist for the data",function(){
                var path = "rulers.v",
                    options = {key: 'pageId2'},
                    dataToSave = {desktop: [1], mobile: [0,0]};
                runs(function(){
                    UPH._userPrefData.data = {};
                });

                runs(function(){
                    UPH.setData(path,dataToSave,options);
                });

                runs(function(){
                    expect(UPH._userPrefData.data.pageId2.rulers.v).toEqual(dataToSave);
                });
            });
        });

        describe("Deleting data for a key",function(){
            it("should cause that data to be empty and marked dirty for the next save",function(){
                var overrideKey = {key: 'pageId2'},
                    dataToSave = {};
                UPH._userPrefData.data = userPrefData;
                UPH.setData(overrideKey, dataToSave);
                expect(UPH._userPrefData.data.pageId2).toEqual({isDirty: true});

            });
            it("and then saving, should return an empty object for that key on next load",function(){
                var overrideKey = {key: 'pageId2'},
                    dataToSave = {};
                UPH._userPrefData.data = userPrefData;
                UPH.setData(overrideKey,dataToSave);

                overrideCallbacks.onSuccess = function(data){
                    responseData = data;
                    success = true;
                };
                overrideCallbacks.onError = function(){
                    success = false;
                };

                UPH._saveUserPrefsForSite(overrideCallbacks);

                waitsFor(function(){
                    return done && typeof success !== 'undefined';
                }, 'the request did not complete in time', 3000);

                runs(function(){
                    done = false;
                    success = undefined;
                    UPH._loadUserPrefsForSite(overrideCallbacks);
                });
                waitsFor(function(){
                    return done && typeof success !== 'undefined';
                }, 'the request did not complete in time', 3000);

                runs(function(){
                    expect(responseData.pageId2).toEqual({});
                });
            });
        });

        describe("When saving the site", function(){
            it("a key with changed data should be saved, but a key without changed data should not be saved",function(){
                var path = "rulers.v",
                    options = {key: 'pageId2'},
                    dataToSave = {desktop: [1], mobile: [0,0]};
                UPH._userPrefData.data = userPrefData;
                UPH.setData(path, dataToSave, options);

                overrideCallbacks.onSuccess = function(data){
                    responseData = data;
                    success = true;
                };
                overrideCallbacks.onError = function(){
                    success = false;
                };

                UPH._saveUserPrefsForSite(overrideCallbacks);

                waitsFor(function(){
                    return done && success;
                }, 'the request did not complete in time', 3000);

                runs(function(){

                    expect(responseData.pageId1).toBeUndefined();
                });

                runs(function(){
                    expect(UPH._userPrefData.data.pageId2.rulers.v).toEqual(dataToSave);
                });
            });
        });



    });
});
