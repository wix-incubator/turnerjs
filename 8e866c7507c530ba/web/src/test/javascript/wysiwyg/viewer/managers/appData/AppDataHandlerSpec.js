describe('wysiwyg.managers.appdata.AppDataHandler', function() {
    var h;

    beforeEach(function() {
        h = this._appDataHandler = W.Viewer.getAppDataHandler();
        this.mockComponent = {
                    handleHeightChange: function() {},
                    handleAppSettingsChange: function(){},
                    handleAppIsAlive: function(){}

                };

    });

    it('should manage tpa data correctly', function() {
        var WIDGET_GUID = "widget-guid";
        var APP_ID = "3";
        var APP_DEF_ID = "acme_appDefinition_id";
        var WIDGET_URL = "http://acme.widget.url";
        this._appDataHandler.registerAppData({
              "appDefinitionName" : "ACME Calendar",
              "instance" : "",
              "applicationId" : APP_ID,
              "appDefinitionId" : APP_DEF_ID,
              "widgets" : {
                "widget-guid" : {
                  "widgetUrl" : WIDGET_URL,
                  "widgetId" : WIDGET_GUID
                }
              }
        });

        var appData = this._appDataHandler.getAppData( APP_ID );
        expect(appData).toBeDefined();
        expect(appData.appDefinitionId == APP_DEF_ID).toBeTruthy();

        var widgetData = this._appDataHandler.getWidgetData( APP_ID , WIDGET_GUID);
        expect(widgetData).toBeDefined();

        expect(widgetData && widgetData.widgetUrl == WIDGET_URL).toBeTruthy();
    });

    describe('getLargestApplicationId', function() {
        it('should return the highest applicationId', function() {
            spyOn(h, 'getAppsData').andReturn({
                '12': 'value12',
                '14': 'value14'
            });

            expect(h.getLargestApplicationId()).toBe(14);
        });

        it('should filter out non-numeric keys', function() {
            spyOn(h, 'getAppsData').andReturn({
                'notanumber': 'valuenotanumber',
                '12': 'value12',
                '14': 'value14'
            });

            expect(h.getLargestApplicationId()).toBe(14);
        });

        it('should return 0 for an empty object', function() {
            spyOn(h, 'getAppsData').andReturn({});

            expect(h.getLargestApplicationId()).toBe(0);
        });
    });

    describe('getAppDataByAppDefinitionId', function() {
        it('should return only the part of the object that matches by appDefinitionId', function() {
            spyOn(h, 'getAppsData').andReturn({
                '12': {appDefinitionId: '123', whatNot: 1},
                '13': {appDefinitionId: '456', whatNot: 2}
            });

            expect(h.getAppDataByAppDefinitionId('123')).toBeEquivalentTo({appDefinitionId: '123', whatNot: 1});
        });

        it('should return an empty object when no values match', function() {
            spyOn(h, 'getAppsData').andReturn({
                '12': {appDefinitionId: '123', whatNot: 1},
                '13': {appDefinitionId: '456', whatNot: 3}
            });

            expect(h.getAppDataByAppDefinitionId('789')).toBeEquivalentTo({});
        });
    });



});

