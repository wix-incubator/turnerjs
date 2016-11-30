define([
    'lodash',
    'testUtils',
    'documentServices/component/componentCode',
    'documentServices/hooks/hooks',
    'documentServices/hooks/componentHooks/nickname',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/constants/constants',
    'documentServices/documentMode/documentMode',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/mobileConversion/mobileActions'
], function (_, testUtils, componentsCode, hooks, nickname, privateServicesHelper, componentServices, structureService, wixCodeLifecycleService, constants, documentMode, componentDetectorAPI, mobileActions) {
    'use strict';

    describe('nickname hooks', function () {
        beforeEach(function () {
            testUtils.experimentHelper.openExperiments('connectionsData');
        });

        function getSiteDataWithWixCode() {
            return testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
        }

        describe('add component', function () {
            beforeEach(function () {
                hooks.unregisterAllHooks();
                hooks.registerHook(hooks.HOOKS.ADD.BEFORE, nickname.removeNicknameFromSerializedComponentIfInvalid);
                hooks.registerHook(hooks.HOOKS.ADD.AFTER, nickname.generateNicknamesForComponent);
            });
            afterAll(hooks.unregisterAllHooks);

            it('should generate a new nickname if the nickname of the new component is already in use in the page', function () {
                var compNickname = 'button1';
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId);
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});
                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var componentToAdd = {
                    id: "newComp",
                    componentType: "wysiwyg.viewer.components.SiteButton",
                    layout: {properties: {}, anchors: []},
                    connections: testUtils.mockFactory.connectionMocks.connectionList(connections),
                    data: 'LinkableButton',
                    props: 'ButtonProperties',
                    style: 'b1'
                };

                var pagePointer = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = componentServices.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                componentServices.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                var actual = componentsCode.getNickname(privateServices, compPointer);

                expect(actual).not.toEqual(compNickname);
                expect(actual).toEqual(jasmine.any(String));
            });

            it('should generate a new nickname if the nickname of the new component is already in use in masterPage', function () {
                var compNickname = 'button1';
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId);
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {connections: connections});
                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var componentToAdd = {
                    id: "newComp",
                    componentType: "wysiwyg.viewer.components.SiteButton",
                    layout: {properties: {}, anchors: []},
                    connections: testUtils.mockFactory.connectionMocks.connectionList(connections),
                    data: 'LinkableButton',
                    props: 'ButtonProperties',
                    style: 'b1'
                };

                var pagePointer = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = componentServices.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                componentServices.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                var actual = componentsCode.getNickname(privateServices, compPointer);
                expect(actual).not.toEqual(compNickname);
                expect(actual).toEqual(jasmine.any(String));
            });

            it('should not generate a new nickname if the nickname of the new component is used only in other page', function () {
                var compNickname = 'button1';
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId)
                    .addPageWithDefaults('otherPage');
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: connections});
                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var componentToAdd = {
                    id: "newComp",
                    componentType: "wysiwyg.viewer.components.SiteButton",
                    layout: {properties: {}, anchors: []},
                    connections: testUtils.mockFactory.connectionMocks.connectionList(connections),
                    data: 'LinkableButton',
                    props: 'ButtonProperties',
                    style: 'b1'
                };

                var pagePointer = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = componentServices.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                componentServices.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                var actual = componentsCode.getNickname(privateServices, compPointer);
                expect(actual).toEqual(compNickname);
            });

            it('should generate a new nickname if no nickname was defined in the component structure', function () {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId);
                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var componentToAdd = {
                    id: "newComp",
                    componentType: "wysiwyg.viewer.components.SiteButton",
                    layout: {properties: {}, anchors: []},
                    data: 'LinkableButton',
                    props: 'ButtonProperties',
                    style: 'b1'
                };

                var pagePointer = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = componentServices.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                componentServices.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                var actual = componentsCode.getNickname(privateServices, compPointer);
                expect(actual).toEqual(jasmine.any(String));
            });

            it('should not generate nickname if wix code is not provisioned', function () {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId);
                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                spyOn(wixCodeLifecycleService, 'isProvisioned').and.returnValue(false);

                var componentToAdd = {
                    id: "newComp",
                    componentType: "wysiwyg.viewer.components.SiteButton",
                    layout: {properties: {}, anchors: []},
                    data: 'LinkableButton',
                    props: 'ButtonProperties',
                    style: 'b1'
                };

                var pagePointer = privateServices.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = componentServices.getComponentToAddRef(privateServices, pagePointer, componentToAdd, 'customId');
                componentServices.add(privateServices, compPointer, pagePointer, componentToAdd, 'customId');

                var actual = componentsCode.getNickname(privateServices, compPointer);
                expect(actual).toBeUndefined();
            });
        });

        describe('change parent', function () {
            function getCompPointer(privateServices, compStructure, pageId) {
                var componentPointers = privateServices.pointers.components;
                var desktopPage = componentPointers.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return componentPointers.getComponent(compStructure.id, desktopPage);
            }

            function getNickname(privateServices, compStructure, pageId) {
                var compPointer = getCompPointer(privateServices, compStructure, pageId);
                return componentsCode.getNickname(privateServices, compPointer);
            }

            beforeEach(function () {
                hooks.unregisterAllHooks();
                hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.BEFORE, nickname.deleteNicknameFromComponentIfInvalid);
                hooks.registerHook(hooks.HOOKS.CHANGE_PARENT.AFTER, nickname.generateNicknamesForComponent);
            });

            it('should replace the nickname of a component if it is moving to masterPage and there is a component with that nickname on other page', function () {
                var pageId = 'pageId1';
                var compNickname = 'button1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults('otherPage')
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: connections});
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: _.cloneDeep(connections)});
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var pagePointer = ps.pointers.components.getPage('masterPage', constants.VIEW_MODES.DESKTOP);
                var compPointer = getCompPointer(ps, compStructure, pageId);
                structureService.setContainer(ps, compPointer, compPointer, pagePointer);

                var actual = componentsCode.getNickname(ps, compPointer);
                expect(actual).not.toEqual(compNickname);
                expect(actual).toEqual(jasmine.any(String));
            });

            it('should replace the nickname of children components if their container is moving to masterPage and there are components with those nicknames on other pages', function () {
                var pageId = 'pageId1';
                var firstChildNickname = 'button1';
                var secondChildNickname = 'button2';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults('otherPage')
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();
                var firstChildconnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(firstChildNickname)];
                var secondChildConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(secondChildNickname)];
                var containerConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('topContainer')];

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: _.cloneDeep(firstChildconnection)}, false, 'existingButton1');
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: _.cloneDeep(secondChildConnection)}, false, 'existingButton2');

                var firstChildStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: _.cloneDeep(firstChildconnection)}, false, 'newButton1');
                var secondChildStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: _.cloneDeep(secondChildConnection)}, false, 'newButton2');
                var parentStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {connections: containerConnection}, false, 'container1', {components: []});


                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var firstChildPointer = getCompPointer(ps, firstChildStructure, pageId);
                var secondChildPointer = getCompPointer(ps, secondChildStructure, pageId);
                var parentPointer = getCompPointer(ps, parentStructure, pageId);
                structureService.setContainer(ps, firstChildPointer, firstChildPointer, parentPointer);
                structureService.setContainer(ps, secondChildPointer, secondChildPointer, parentPointer);

                var masterPagePointer = ps.pointers.components.getPage('masterPage', constants.VIEW_MODES.DESKTOP);
                structureService.setContainer(ps, parentPointer, parentPointer, masterPagePointer);

                var updatedFirstChildNickname = getNickname(ps, firstChildStructure, pageId);
                var updatedSecondChildNickname = getNickname(ps, secondChildStructure, pageId);

                expect(updatedFirstChildNickname).toEqual(jasmine.any(String));
                expect(updatedSecondChildNickname).toEqual(jasmine.any(String));
                expect(updatedFirstChildNickname).not.toEqual(firstChildNickname);
                expect(updatedSecondChildNickname).not.toEqual(secondChildNickname);
            });

            it('should replace the nickname of children components recursively if the top container is moving to masterPage and there are components with those nicknames on other pages', function () {
                var pageId = 'pageId1';
                var childNickname = 'button1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults('otherPage')
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();

                var childConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(childNickname)];
                var childContainerConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('childContainer')];
                var topContainerConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('topContainer')];

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: childConnection}, false, 'existingButton1');

                var grandchildCompStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: childConnection}, false, 'newButton1');
                var childContainerStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {connections: childContainerConnection}, false, 'containerId', {components: [grandchildCompStructure]});
                var parentContainerStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {connections: topContainerConnection}, false, 'topContainerId', {components: [childContainerStructure]});


                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var masterPagePointer = ps.pointers.components.getPage('masterPage', constants.VIEW_MODES.DESKTOP);
                var parentContainerPointer = getCompPointer(ps, parentContainerStructure, pageId);
                structureService.setContainer(ps, parentContainerPointer, parentContainerPointer, masterPagePointer);

                var updatedchildNickname = getNickname(ps, grandchildCompStructure, pageId);

                expect(updatedchildNickname).toEqual(jasmine.any(String));
                expect(updatedchildNickname).not.toEqual(childNickname);
            });

            it('should keep the nickname of a component if it is moving from masterPage to a page and there are no components with this nickname in the new page', function () {
                var pageId = 'pageId1';
                var compNickname = 'button1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();

                var otherCompConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('other_nick_name')];
                var thisCompNickname = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: otherCompConnection});
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {connections: thisCompNickname});
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = getCompPointer(ps, compStructure, 'masterPage');
                structureService.setContainer(ps, compPointer, compPointer, pagePointer);

                var actual = componentsCode.getNickname(ps, compPointer);
                expect(actual).toEqual(compNickname);
            });

            it('should replace the nickname if the component is moved to a container in masterPage and there is other component in different page with the same nickname', function () {
                var pageId = 'pageId1';
                var compNickname = 'button1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults('otherPage')
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();

                var compConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];
                var containerConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('container1')];

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'otherPage', {connections: compConnection});
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, 'masterPage', {connections: containerConnection}, false, null, {components: []});
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: compConnection});
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(ps, compStructure, pageId);
                var containerPointer = getCompPointer(ps, container, 'masterPage');
                structureService.setContainer(ps, compPointer, compPointer, containerPointer);

                var actual = componentsCode.getNickname(ps, compPointer);
                expect(actual).not.toEqual(compNickname);
                expect(actual).toEqual(jasmine.any(String));
            });

            it('should not change nickname when moving to a different container in the same page', function () {
                var pageId = 'pageId1';
                var compNickname = 'button1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId)
                    .addMeasureMap();

                var compConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(compNickname)];
                var containerConnection = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('container1')];

                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {connections: containerConnection}, false, null, {components: []});
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: compConnection});
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(ps, compStructure, pageId);
                var containerPointer = getCompPointer(ps, container, pageId);
                structureService.setContainer(ps, compPointer, compPointer, containerPointer);

                var actual = componentsCode.getNickname(ps, compPointer);
                expect(actual).toEqual(compNickname);
            });
            afterAll(hooks.unregisterAllHooks);
        });

        describe('after mobile conversion', function() {

            beforeAll(function () {
                hooks.registerHook(hooks.HOOKS.MOBILE_CONVERSION.AFTER, nickname.generateNicknamesForComponent);
            });

            it('should generate nicknames for mobile only components', function() {
                var pageId = 'pageId1';
                var siteData = getSiteDataWithWixCode()
                    .addPageWithDefaults(pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                mobileActions.initialize(privateServices);

                documentMode.setViewMode(privateServices, constants.VIEW_MODES.MOBILE);

                var masterPagePointer = privateServices.pointers.components.getPage('masterPage', constants.VIEW_MODES.MOBILE);
                var tinyMenuCompPointer = componentDetectorAPI.getComponentByType(privateServices, 'wysiwyg.viewer.components.mobile.TinyMenu', masterPagePointer)[0];
                var tinyMenuNickname = componentsCode.getNickname(privateServices, tinyMenuCompPointer);

                expect(tinyMenuNickname).toEqual('mobileMenu1');
            });
            afterAll(hooks.unregisterAllHooks);
        });
    });
});
