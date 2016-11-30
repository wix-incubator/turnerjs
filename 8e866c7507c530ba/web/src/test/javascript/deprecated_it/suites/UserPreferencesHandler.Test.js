testRequire().classes('wysiwyg.deployment.JasmineEditorHelper');

var UPH, done, success, overrideCallbacks, userPrefData, revision, userId, nameSpace, previousRevision;


describe("editor", function () {

    beforeEach(function() {
        window.editor = window.editor || new this.JasmineEditorHelper();
        done = false;
        success = false;
        overrideCallbacks = {
            "onComplete": function(){done = true;}
        };
        UPH = W.Editor.userPreferencesHandler;
    });

    it("should be ready (loaded)", function () {
        waitsFor(function () {
            return editor && editor.isReady();
        }, 'editor to finish loading', 10000);
        runs(function() {
            expect(editor.isReady()).toBeTruthy();
        });
    });

    describe("UserPreferences:", function () {

        beforeEach(function(){
            UPH._userPrefData ={};
            userPrefData = {
                "nameSpace": nameSpace,
                "revision": window.editorModel.siteHeader.revision,
                "siteId" : window.editorModel.siteHeader.userId,
                "data": {
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
                }
            }
        });

        describe("The setForSite API", function () {
            it("should successfully save a single blob's data based on the key, siteId and userid", function () {

                runs(function(){
                    UPH._userPrefData = userPrefData;
                    previousRevision = W.Editor.userPreferencesHandler._userPrefData.revision;
                    overrideCallbacks.onSuccess = function(){
                        window.editorModel.siteHeader.revision ++;
                        UPH._userPrefData.revision ++;
                        success = true;
                    };
                    overrideCallbacks.onError = function(){
                        success = false;
                    };
                });

                runs(function(){
                    UPH._saveAllUserPrefs(overrideCallbacks);
                });

                waitsFor(function () {
                    return done;
                }, 'the request did not complete in time', 2000);

                runs(function () {
                    expect(success).toBeTruthy();
                    expect(previousRevision).toEqual(UPH._userPrefData.revision - 1);
                });
            });
        });


        describe("The load all user preferences request", function () {
            it("should successfully get the preferences for the site", function () {
                runs(function(){
                    overrideCallbacks.onSuccess = function(){
                        success = true;
                    };
                    overrideCallbacks.onError = function(){
                        success = false;
                    };
                });

                runs(function(){
                    UPH._loadAllUserPrefs(overrideCallbacks);
                });

                waitsFor(function(){
                    return done;
                }, 'the request did not complete in time', 2000);

                runs(function () {
                    //note that we're testing vs success, and not vs the loaded data,
                    // since there is no guarantee that there will be data saved on the server
                    expect(success).toBeTruthy();
                });
            });
        });

        describe("Trying to fetch data by path", function(){
           it("should return the requested data if it exists",function(){
               var path = "rulers.v",
                   options = {pageId: 'pageId2'},
                   loadedData;
               runs(function(){
                   UPH._userPrefData = userPrefData;
               });


               runs(function(){
                   UPH.getData(path,options).then(function(data){
                       loadedData = data;
                       done = true;
                   });
               });

                waitsFor(function(){
                    return done;
                },'could not retrieve the data from the UserPreferencesHandler in time', 2000);

               runs(function(){
                   expect(loadedData).toEqual({desktop: [12, 112, 1112], mobile: [22,222,2222] });
               });
           });
            it("should return an empty object if it does not exist",function(){
                var path = "rulers.v",
                    options = {pageId: 'pageId2'},
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
                },'could not retrieve the data from the UserPreferencesHandler in time', 1000);

                runs(function(){
                    expect(loadedData).toEqual({});
                });
            });
        });

        describe("Trying to set data for a path",function(){
           it("should override the existing data at that specific path if data already exists",function(){
               var path = "rulers.v",
                   options = {pageId: 'pageId2'},
                   dataToSave = {desktop: [1], mobile: [0,0]};
               runs(function(){
                    UPH._userPrefData = userPrefData;
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
                    options = {pageId: 'pageId2'},
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




    });
});