define(['lodash',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/siteMetadata/clientSpecMap'],
    function(_, siteMetadata, clientSpecMap) {
        'use strict';
        describe('ClientSpecMap service', function() {
            var mockAppsData = {
                18: {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    type: "livechat",
                    widgets: {}
                },
                19: {
                    appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                    appDefinitionName: "Dropifi Contact Widget",
                    applicationId: 19,
                    instance: "1234",
                    type: "dropifi",
                    widgets: {}
                }

            };

            describe("Return the client spec map", function() {
                it("should return an empty object if CLIENT_SPEC_MAP property does not exist", function(){
                    spyOn(siteMetadata, "getProperty").and.returnValue(null);

                    var appsData = clientSpecMap.getAppsData();

                    expect(appsData).toEqual({});
                });

                it("should return an empty object if there are no apps installed on site", function(){
                    spyOn(siteMetadata, "getProperty").and.returnValue({});

                    var appsData = clientSpecMap.getAppsData();

                    expect(appsData).toEqual({});
                });

                it("should return object containing app id to an object define app data", function(){

                    spyOn(siteMetadata, "getProperty").and.returnValue(mockAppsData);

                    var appsData = clientSpecMap.getAppsData();

                    expect(appsData).toEqual(mockAppsData);

                });
            });

            describe("Manipulate app data", function(){

                beforeEach(function(){
                    spyOn(siteMetadata, "getProperty").and.returnValue(mockAppsData);
                    spyOn(siteMetadata, "setProperty").and.callFake(function(ps, property, newAppsData){
                        mockAppsData = newAppsData;
                    });
                });

                describe("test registerAppData", function(){
                    it("register new app data", function(){
                        var newAppData = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576",
                            appDefinitionName: "xxx Contact Widget",
                            applicationId: 20,
                            instance: "12345",
                            widgets: {}
                        };

                        expect(_(clientSpecMap.getAppsData()).keys().includes("20")).toBeFalsy();
                        clientSpecMap.registerAppData(null, newAppData);
                        expect(_(clientSpecMap.getAppsData()).keys().includes("20")).toBeTruthy();
                        expect(clientSpecMap.getAppsData()["20"]).toEqual(newAppData);

                    });

                    it("register existing  app data", function(){
                        var existingAppData = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                            appDefinitionName: "Dropifi Contact Widget",
                            applicationId: 19,
                            instance: "1234",
                            widgets: {}
                        };

                        expect(_(clientSpecMap.getAppsData()).keys().includes("19")).toBeTruthy();
                        clientSpecMap.registerAppData(null, existingAppData);
                        expect(_(clientSpecMap.getAppsData()).keys().includes("19")).toBeTruthy();
                        expect(clientSpecMap.getAppsData()["19"]).toEqual(existingAppData);
                    });

                    it("register existing  app data and update it", function(){
                        var existingAppData = {
                            appDefinitionId: "1311c9da-51ef-f7ae-2576-3704c9c08c51",
                            appDefinitionName: "Dropifi Contact Widget",
                            applicationId: 19,
                            instance: "12345555",
                            widgets: {}
                        };

                        expect(_(clientSpecMap.getAppsData()).keys().includes("19")).toBeTruthy();
                        clientSpecMap.registerAppData(null, existingAppData);
                        expect(_(clientSpecMap.getAppsData()).keys().includes("19")).toBeTruthy();
                        expect(clientSpecMap.getAppsData()["19"]).toEqual(existingAppData);

                        expect(clientSpecMap.getAppsData()["19"].instance).toEqual(existingAppData.instance);

                    });
                });

                describe("test getAppData", function() {
                    it("get empty object if application id not exist", function() {
                        expect(clientSpecMap.getAppData(null, "21")).toEqual({});
                    });

                    it("get app data of application id that exists", function() {
                        expect(clientSpecMap.getAppData(null, "19")).toEqual(mockAppsData[19]);
                    });
                });

                describe("filterAppsDataByType", function() {
                    it("get empty array if application type not exist", function() {
                        expect(clientSpecMap.filterAppsDataByType(null, "appbuilder")).toEqual([]);
                    });

                    it("get array of app data for application type that exists", function() {
                        expect(clientSpecMap.filterAppsDataByType(null, "livechat")).toEqual([mockAppsData[18]]);
                    });
                });

                describe("test getAppDataByAppDefinitionId", function() {
                    it("get empty object if app definition id not exist", function() {
                        expect(clientSpecMap.getAppDataByAppDefinitionId(null, "21")).toBeUndefined();
                    });

                    it("get app data of application id that exists", function() {
                        expect(clientSpecMap.getAppDataByAppDefinitionId(null, "1311c9da-51ef-f7ae-2576-3704c9c08c51")).toEqual(mockAppsData[19]);
                    });
                });

            });

        });
    });

