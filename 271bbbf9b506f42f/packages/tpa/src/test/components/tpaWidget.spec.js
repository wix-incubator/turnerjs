define(['lodash', 'testUtils', 'tpa/components/tpaWidget'], function (_, testUtils, tpaWidget) {
    'use strict';

    var mock = testUtils.mockFactory;

    var widgetUrl = "http://wix-dropbox.elasticbeanstalk.com/file-list";
    var instance = "lomDbcMnzz94w5UerKxJIsUlgDci8HwpAvuzD15ym-4.eyJpbnN0YW5jZUlkIjoiMTM2ZTFlYjQtMTE0NC1mNTcwLWJhMWItZjE4OWE4OTkwOGVkIiwic2lnbkRhdGUiOiIyMDE0LTA3LTE0VDE1OjI3OjIxLjE4MVoiLCJpcEFuZFBvcnQiOiI5MS4xOTkuMTE5LjI1NC8zODU5OCIsImRlbW9Nb2RlIjpmYWxzZX0";
    var publicModel = {
        language: 'en'
    };
    var clientSpecMap = {
        clientSpecMap: {
            7: {
                appDefinitionId: "129acb44-2c8a-8314-fbc8-73d5b973a88f",
                appDefinitionName: "Google Event Calendar",
                appRequirements: {},
                applicationId: 7,
                installedAtDashboard: true,
                instance: instance,
                sectionMobilePublished: false,
                sectionPublished: true,
                sectionSeoEnabled: true,
                type: "public",
                widgets: {
                    '12e9819b-b62d-e79e-b13f-6e2c29d0082c': {
                        mobilePublished: true,
                        mobileUrl: "http://wix-dropbox.elasticbeanstalk.com/file-list",
                        published: true,
                        refreshOnWidthChange: true,
                        seoEnabled: true,
                        widgetId: "12e9819b-b62d-e79e-b13f-6e2c29d0082c",
                        widgetUrl: widgetUrl
                    }
                }
            }
        },
        siteInfo: {}
    };
    var appData = {
        applicationId: "7",
        id: "cqhi",
        widgetId: "12e9819b-b62d-e79e-b13f-6e2c29d0082c"
    };
    var style = {
        height: 261,
        left: 0,
        position: "absolute",
        top: 65,
        width: 270
    };
    var compId = 'compId';

    var getComponent = function (props) {
        return testUtils.getComponentFromDefinition(tpaWidget, props);
    };

    var givenCompWith = function (clientSpcMap, publicMdl, compAppData, compStyle, id) {
        var compProps = mock.mockProps()
            .addSiteData(clientSpcMap, 'rendererModel')
            .addSiteData(publicMdl, 'publicModel')
            .setCompData(compAppData)
            .setSkin("wysiwyg.viewer.skins.TPAWidgetSkin");

        compProps.style = compStyle;
        compProps.id = id;
        compProps.pageId = 'fooBar';
        compProps.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';

        return getComponent(compProps);
    };

    describe('tpaWidget component dom', function () {
        it('should set no scrolling to the widget iframe', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.iframe).toBeDefined();
        });

        it('should set the iframe style', function () {
            var comp = givenCompWith(clientSpecMap, publicModel, appData, {}, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData.iframe).toBeDefined();
        });

        it('should return inline style', function () {
            style = {
                height: 261,
                left: 0,
                position: "absolute",
                top: 65,
                width: 270
            };

            compId = 'compId';
            var comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);
            var refData = comp.getSkinProperties();

            expect(refData).toBeDefined();
            expect(refData[""]).toBeDefined();
            expect(refData[""].style.left).toBe(style.left);
            expect(refData[""].style.position).toBe(style.position);
            expect(refData[""].style.top).toBe(style.top);
            expect(refData[""].style.width).toBe(style.width);
        });
    });


    describe("tpaWidget state", function () {
        var comp;

        var heightState = {
            height: 100
        };

        beforeEach(function () {
            comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);

            spyOn(comp, 'setState').and.callFake(function(nextState){
                _.assign(this.state, nextState);
            });

            comp.setState(heightState);
        });

        it("should set component height when height state changes", function () {
            expect(comp.getSkinProperties()[""].style.height).toBe(heightState.height);
        });
    });

    describe('mutateIframeUrlQueryParam', function() {
        var comp;
        var widthState = {
            initialWidth: 100
        };
        var queryParamsObj = {};
        beforeEach(function() {
            comp = givenCompWith(clientSpecMap, publicModel, appData, style, compId);

            spyOn(comp, 'setState').and.callFake(function(nextState){
                _.assign(this.state, nextState);
            });

            comp.setState(widthState);
        });

        it('should add initial width to the query params', function() {
            var expectedQueryParams = {
               width: widthState.initialWidth
            };
            expect(comp.mutateIframeUrlQueryParam(queryParamsObj)).toEqual(expectedQueryParams);
        });

        it('should add orig comp Id to the query params if origCompId is set', function() {
            comp.props.structure.originCompId = '123';
            var expectedQueryParams = {
                width: widthState.initialWidth,
                originCompId: '123'
            };
            expect(comp.mutateIframeUrlQueryParam(queryParamsObj)).toEqual(expectedQueryParams);
        });
    });

});
