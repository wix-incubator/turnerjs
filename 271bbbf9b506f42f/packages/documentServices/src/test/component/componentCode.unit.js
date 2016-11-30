define([
    'lodash',
    'siteUtils',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/component/componentCode',
    'documentServices/constants/constants'
], function (_, siteUtils, testUtils, privateServicesHelper, componentServices, componentsCode, constants) {
    "use strict";

    function getCompPointer(privateServices, compStructure, pageId, viewMode) {
        var componentPointers = privateServices.pointers.components;
        var desktopPage = getPagePointer(privateServices, pageId, viewMode);
        return componentPointers.getComponent(compStructure.id, desktopPage);
    }

    function getDesktopPagePointer(privateServices, pageId) {
        return getPagePointer(privateServices, pageId, constants.VIEW_MODES.DESKTOP);
    }

    function getPagePointer(privateServices, pageId, viewMode) {
        viewMode = viewMode || constants.VIEW_MODES.DESKTOP;
        return privateServices.pointers.components.getPage(pageId, viewMode);
    }

    function getNickName(privateServices, compStructure, pageId, viewMode) {
        var compPointer = getCompPointer(privateServices, compStructure, pageId, viewMode);
        return componentsCode.getNickname(privateServices, compPointer);
    }

    describe('componentsCode', function () {

        beforeEach(function() {
            testUtils.experimentHelper.openExperiments('connectionsData');
        });

        describe('generateNicknamesForSite', function () {

            it('should generate name for a single component in a single page', function () {
                var pageId = 'pageId1';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname = getNickName(privateServices, compStructure, pageId);

                expect(compNickname).toEqual('button1');
            });

            it('should generate name for a two components of the same type in a single page', function () {
                var pageId = 'pageId1';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, pageId);

                expect(compNickname1).toEqual('button2');
                expect(compNickname2).toEqual('button1');
            });

            it('should generate name for a two components of the same type in two pages', function () {
                var pageId1 = 'pageId1';
                var pageId2 = 'pageId2';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId1)
                    .addPageWithDefaults(pageId2);

                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage');
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId1);
                var compStructure3 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId2);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, 'masterPage');
                var compNickname2 = getNickName(privateServices, compStructure2, pageId1);
                var compNickname3 = getNickName(privateServices, compStructure3, pageId2);

                expect(compNickname1).toEqual('button2');
                expect(compNickname2).toEqual('button1');
                expect(compNickname3).toEqual('button1');
            });

            it('should not generate name for a who is not in the pageIdsList', function () {
                var pageId1 = 'pageId1';
                var pageId2 = 'pageId2';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId1)
                    .addPageWithDefaults(pageId2);

                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage');
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId1);
                var compStructure3 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId2);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForPages(privateServices, [pageId1]);

                var compNickname1 = getNickName(privateServices, compStructure1, 'masterPage');
                var compNickname2 = getNickName(privateServices, compStructure2, pageId1);
                var compNickname3 = getNickName(privateServices, compStructure3, pageId2);

                expect(compNickname1).toEqual('button2');
                expect(compNickname2).toEqual('button1');
                expect(compNickname3).toBeUndefined();
            });

            it('should generate name for a two components of the same type and another one from other type in a single page', function () {
                var pageId = 'pageId1';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);
                var compStructure3 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.Video', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, pageId);
                var compNickname3 = getNickName(privateServices, compStructure3, pageId);

                expect(compNickname1).toEqual('button2');
                expect(compNickname2).toEqual('button1');
                expect(compNickname3).toEqual('video1');
            });

            it('should generate name for a two components of different type but same nickname', function () {
                var pageId = 'pageId1';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.Stupid', siteData, pageId);
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.other.components.Stupid', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, pageId);

                expect(compNickname1).toEqual('stupid2');
                expect(compNickname2).toEqual('stupid1');
            });

            it('should consider existing nicknames, which match the component nickname when generating new nicknames (has nicknames with the expected prefix)', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button25')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, pageId);

                expect(compNickname1).toEqual('button25');
                expect(compNickname2).toEqual('button26');
            });

            it('should consider existing nicknames, which match the component nickname when generating new nicknames (no nicknames with the expected prefix)', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('yehotam')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, pageId);

                expect(compNickname1).toEqual('yehotam');
                expect(compNickname2).toEqual('button1');
            });

            it('should consider existing nicknames in all pages, which match the component nickname when generating new nicknames in masterPage', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});
                var compStructure2 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage');

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var compNickname1 = getNickName(privateServices, compStructure1, pageId);
                var compNickname2 = getNickName(privateServices, compStructure2, 'masterPage');

                expect(compNickname1).toEqual('button1');
                expect(compNickname2).toEqual('button2');
            });

            it('should set nicknames for nested components', function () {
                var pageId = 'pageId1';
                var button = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var container = testUtils.mockFactory.createStructure('mobile.core.components.Container', {components: [button]});
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([container], pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices);

                var containerNickname = getNickName(privateServices, container, pageId);
                var buttonNickname = getNickName(privateServices, button, pageId);

                expect(containerNickname).toEqual('container1');
                expect(buttonNickname).toEqual('button1');
            });

            it('should set the same nickname for a component in desktop mode and in the given view mode', function() {
                var pageId = 'pageId1';
                var button = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([button], pageId) // desktop
                    .setPageComponents([button], pageId, true); // mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices, constants.VIEW_MODES.MOBILE);

                var desktopButtonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.DESKTOP);
                var mobileButtonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.MOBILE);

                expect(desktopButtonNickname).toEqual('button1');
                expect(mobileButtonNickname).toEqual('button1');
            });

            it('should set a nickname for a component which only exists in the given view mode (but not on desktop)', function() {
                var pageId = 'pageId1';
                var button = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([button], pageId, true); // only mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForSite(privateServices, constants.VIEW_MODES.MOBILE);

                var buttonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.MOBILE);

                expect(buttonNickname).toEqual('button1');
            });

            it('should copy a nickname from a desktop component to its structure in the given view mode', function() {
                var pageId = 'pageId1';
                var desktopButtonNickname = 'desktopButtonNickname';
                var mobileButton = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var desktopButton = _.clone(mobileButton);
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([desktopButton], pageId) // desktop
                    .setPageComponents([mobileButton], pageId, true); // mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var desktopCompPointer = getCompPointer(privateServices, desktopButton, pageId, constants.VIEW_MODES.DESKTOP);
                componentsCode.setNickname(privateServices, desktopCompPointer, desktopButtonNickname);
                componentsCode.generateNicknamesForSite(privateServices, constants.VIEW_MODES.MOBILE);

                var mobileButtonNickname = getNickName(privateServices, mobileButton, pageId, constants.VIEW_MODES.MOBILE);

                expect(mobileButtonNickname).toEqual(desktopButtonNickname);
            });

        });

        describe('generateNicknamesForPages', function () {
            it('should set the same nickname for a component in desktop mode and in the given view mode', function() {
                var pageId = 'pageId1';
                var button = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([button], pageId) // desktop
                    .setPageComponents([button], pageId, true); // mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForPages(privateServices, [pageId], constants.VIEW_MODES.MOBILE);

                var desktopButtonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.DESKTOP);
                var mobileButtonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.MOBILE);

                expect(desktopButtonNickname).toEqual('button1');
                expect(mobileButtonNickname).toEqual('button1');
            });

            it('should set a nickname for a component which only exists in the given view mode (but not on desktop)', function() {
                var pageId = 'pageId1';
                var button = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([button], pageId, true); // only mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                componentsCode.generateNicknamesForPages(privateServices, [pageId], constants.VIEW_MODES.MOBILE);

                var buttonNickname = getNickName(privateServices, button, pageId, constants.VIEW_MODES.MOBILE);

                expect(buttonNickname).toEqual('button1');
            });

            it('should copy a nickname from a desktop component to its structure in the given view mode', function() {
                var pageId = 'pageId1';
                var desktopButtonNickname = 'desktopButtonNickname';
                var mobileButton = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton');
                var desktopButton = _.clone(mobileButton);
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents([desktopButton], pageId) // desktop
                    .setPageComponents([mobileButton], pageId, true); // mobile

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var desktopCompPointer = getCompPointer(privateServices, desktopButton, pageId, constants.VIEW_MODES.DESKTOP);
                componentsCode.setNickname(privateServices, desktopCompPointer, desktopButtonNickname);
                componentsCode.generateNicknamesForPages(privateServices, [pageId], constants.VIEW_MODES.MOBILE);

                var mobileButtonNickname = getNickName(privateServices, mobileButton, pageId, constants.VIEW_MODES.MOBILE);

                expect(mobileButtonNickname).toEqual(desktopButtonNickname);
            });
        });

        describe('removeNickname', function () {
            it('should remove the nickname from a component', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(privateServices, compStructure, pageId);
                componentsCode.removeNickname(privateServices, compPointer);

                var compNickname = getNickName(privateServices, compStructure, pageId);

                expect(compNickname).not.toBeDefined();
            });

            it('should not add nickname property if trying to remove nickname before it exists', function () {
                var pageId = 'pageId1';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(privateServices, compStructure1, pageId);
                componentsCode.removeNickname(privateServices, compPointer);

                var compNickname = getNickName(privateServices, compStructure1, pageId);

                expect(compNickname).toBeUndefined();
            });
        });

        describe('hasComponentWithThatNickname', function () {
            it('should return true if there is a component with the given nickname in the page', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = getDesktopPagePointer(ps, pageId);
                var actual = componentsCode.hasComponentWithThatNickname(ps, pagePointer, 'button1');

                expect(actual).toBe(true);
            });

            it('should return true if there is a component with the given nickname in the masterPage', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {connections: connections});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = getDesktopPagePointer(ps, pageId);
                var actual = componentsCode.hasComponentWithThatNickname(ps, pagePointer, 'button1');

                expect(actual).toBe(true);
            });

            it('should return false if there is no other component with the given nickname in the page', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = getDesktopPagePointer(ps, pageId);
                var actual = componentsCode.hasComponentWithThatNickname(ps, pagePointer, 'button1');

                expect(actual).toBe(false);
            });

            it('should return false if there is no other component with the given nickname in the page except for the excluded one', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = getDesktopPagePointer(ps, pageId);
                var compPointer = getCompPointer(ps, compStructure, pageId);
                var actual = componentsCode.hasComponentWithThatNickname(ps, pagePointer, 'button1', compPointer);

                expect(actual).toBe(false);
            });

            it('should return true if there is a component with the given nickname in the page which is not the excluded one', function () {
                var pageId = 'pageId1';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections});
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId);

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var pagePointer = getDesktopPagePointer(ps, pageId);
                var compPointer = getCompPointer(ps, compStructure, pageId);
                var actual = componentsCode.hasComponentWithThatNickname(ps, pagePointer, 'button1', compPointer);

                expect(actual).toBe(true);
            });
        });

        describe('setNickname', function () {

            it('should set new nick name', function () {
                var pageId = 'pageId1';
                var connections1 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var connections2 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections1});
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections2});

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(privateServices, compStructure1, pageId);
                componentsCode.setNickname(privateServices, compPointer, 'button3');

                var compNickname = getNickName(privateServices, compStructure1, pageId);

                expect(compNickname).toEqual('button3');
            });

            it('should throw if trying to set a nickname that another component already have in the same page', function () {
                var pageId = 'pageId1';
                var connections1 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var connections2 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections1});
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections2});

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(privateServices, compStructure1, pageId);

                expect(function (){ componentsCode.setNickname(privateServices, compPointer, 'button2'); }).toThrow(new Error('The new nickname you provided is invalid'));
            });

            it('should throw if trying to set a nickname that another component already have in master page', function () {
                var pageId = 'pageId1';
                var connections1 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var connections2 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections1});
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, 'masterPage', {connections: connections2});

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                var compPointer = getCompPointer(privateServices, compStructure1, pageId);

                expect(function (){ componentsCode.setNickname(privateServices, compPointer, 'button2'); }).toThrow(new Error('The new nickname you provided is invalid'));
            });

        });

        describe('validateNickname', function () {

            it('if nickname doesnt exist in the page or masterPage - VALID', function () {
                expect(validateNickname('button3')).toEqual(componentsCode.VALIDATIONS.VALID);
            });

            it('if nickname exists in the page - ALREADY_EXISTS_IN_PAGE', function () {
                expect(validateNickname('button2')).toEqual(componentsCode.VALIDATIONS.ALREADY_EXISTS);
            });

            it('if nickname exists in the masterPage - ALREADY_EXISTS_IN_MASTER_PAGE', function () {
                expect(validateNickname('button2', true)).toEqual(componentsCode.VALIDATIONS.ALREADY_EXISTS);
            });

            it('if nickname is 128 characters - VALID', function () {
                expect(validateNickname(_.times(128, _.constant('b')).join(''))).toEqual(componentsCode.VALIDATIONS.VALID);
            });

            it('if nickname is 129 characters - TOO_LONG', function () {
                expect(validateNickname(_.times(129, _.constant('b')).join(''))).toEqual(componentsCode.VALIDATIONS.TOO_LONG);
            });

            it('if nickname is 0 characters - TOO_SHORT', function () {
                expect(validateNickname('')).toEqual(componentsCode.VALIDATIONS.TOO_SHORT);
            });

            it('if nickname has a underscore - INVALID_NAME', function () {
                expect(validateNickname('name_1')).toEqual(componentsCode.VALIDATIONS.INVALID_NAME);
            });

	        it("should return  INVALID_NAME if the nickname doesn't start with a letter", function () {
		        expect(validateNickname('1button')).toEqual(componentsCode.VALIDATIONS.INVALID_NAME);
	        });

            function validateNickname(nickname, masterPage) {
                var pageId = 'pageId1';
                var connections1 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button1')];
                var connections2 = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('button2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId);
                var compStructure1 = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {connections: connections1});
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, _.isUndefined(masterPage) ? pageId : 'masterPage', {connections: connections2});

                var privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var compPointer = getCompPointer(privateServices, compStructure1, pageId);

                return componentsCode.validateNickname(privateServices, compPointer, nickname);
            }
        });

        describe('non displayed components', function() {

            function addContainterWithCompNotDisplayedInMode(containerId, siteData, pageId, compId, modeId, connection) {
                testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {
                    modes: {
                        definitions: [
                            {modeId: modeId}
                        ]
                    },
                    components: [
                        testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', siteData, pageId, {
                            modes: {
                                isHiddenByModes: false,
                                overrides: [{
                                    modeIds: [modeId],
                                    isHiddenByModes: true
                                }]
                            },
                            connections: connection
                        }, false, compId)
                    ]}, false, containerId);
            }

            beforeEach(function() {
                this.pageId = 'testPage';
                this.pageContainerId = 'pageContainer';
                this.pageNonDisplayedCompId = 'pageNonDisplayedComp';
                this.pageNonDisplayedCompNickname = 'pageNonDisplayedCompNickname';
                this.dummyPageCompId = 'dummyPageComp';

                this.masterPageId = 'masterPage';
                this.masterPageContainerId = 'masterPageContainer';
                this.masterPageNonDisplayedCompId = 'masterPageNonDisplayedComp';
                this.masterPageNonDisplayedCompNickname = 'masterPageNonDisplayedCompNickname';
                this.dummyMasterPageCompId = 'dummyMasterPageComp';

                var pageConnections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(this.pageNonDisplayedCompNickname)];
                var masterPageConnections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(this.masterPageNonDisplayedCompNickname)];

                this.testModeId = 'testMode';

                this.fullSiteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(this.pageId);

                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.fullSiteData, this.pageId, {}, false, this.dummyPageCompId);
                addContainterWithCompNotDisplayedInMode(this.pageContainerId, this.fullSiteData, this.pageId, this.pageNonDisplayedCompId, this.testModeId, pageConnections);
                testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.fullSiteData, this.masterPageId, {}, false, this.dummyMasterPageCompId);
                addContainterWithCompNotDisplayedInMode(this.masterPageContainerId, this.fullSiteData, this.masterPageId, this.masterPageNonDisplayedCompId, this.testModeId, masterPageConnections);
            });

            describe('hasComponentWithThatNickname', function() {

                it('should return true if there is a component with the given nickname which is not currently displayed in the page', function() {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);

                    ps.siteAPI.activateModeById(this.pageContainerId, this.pageId, this.testModeId);

                    expect(componentsCode.hasComponentWithThatNickname(ps, pagePointer, this.pageNonDisplayedCompNickname)).toBe(true);
                });

                it('should return true if there is a component with the given nickname which is not currently displayed in the master page', function() {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.masterPageId);

                    ps.siteAPI.activateModeById(this.masterPageContainerId, this.masterPageId, this.testModeId);

                    expect(componentsCode.hasComponentWithThatNickname(ps, pagePointer, this.masterPageNonDisplayedCompNickname)).toBe(true);
                });
            });

            describe('setNickname', function () {

                it('should throw if trying to set a nickname of another component which is not currently displayed in the page', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var compPointer = ps.pointers.components.getComponent(this.dummyPageCompId, pagePointer);

                    ps.siteAPI.activateModeById(this.pageContainerId, this.pageId, this.testModeId);

                    var setNickNameExistingInPage = _.partial(componentsCode.setNickname, ps, compPointer, this.pageNonDisplayedCompNickname);
                    expect(setNickNameExistingInPage).toThrow(new Error('The new nickname you provided is invalid'));
                });

                it('should throw if trying to set a nickname of another component which is not currently displayed in the master page', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var compPointer = ps.pointers.components.getComponent(this.dummyPageCompId, pagePointer);

                    ps.siteAPI.activateModeById(this.masterPageContainerId, this.masterPageId, this.testModeId);

                    var setNickNameExistingInMasterPage = _.partial(componentsCode.setNickname, ps, compPointer, this.masterPageNonDisplayedCompNickname);
                    expect(setNickNameExistingInMasterPage).toThrow(new Error('The new nickname you provided is invalid'));
                });

            });

            describe('validateNickname', function () {

                it('if nickname exists but not displayed in the page  - ALREADY_EXISTS_IN_PAGE', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var compPointer = ps.pointers.components.getComponent(this.dummyPageCompId, pagePointer);

                    ps.siteAPI.activateModeById(this.pageContainerId, this.pageId, this.testModeId);

                    var validation = componentsCode.validateNickname(ps, compPointer, this.pageNonDisplayedCompNickname);
                    expect(validation).toEqual(componentsCode.VALIDATIONS.ALREADY_EXISTS);
                });

                it('if nickname exists but not displayed in the masterPage - ALREADY_EXISTS_IN_MASTER_PAGE', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var compPointer = ps.pointers.components.getComponent(this.dummyPageCompId, pagePointer);

                    ps.siteAPI.activateModeById(this.masterPageContainerId, this.masterPageId, this.testModeId);

                    var validation = componentsCode.validateNickname(ps, compPointer, this.masterPageNonDisplayedCompNickname);
                    expect(validation).toEqual(componentsCode.VALIDATIONS.ALREADY_EXISTS);
                });

            });

            describe('generateNicknamesForSite', function () {

                it('should consider existing nicknames of components which are not displayed in the page', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var nonDisplayedCompWithNickname = ps.pointers.components.getComponent(this.pageNonDisplayedCompId, pagePointer);
                    var pageCompWithoutNickname = ps.pointers.components.getComponent(this.dummyPageCompId, pagePointer);

                    componentsCode.setNickname(ps, nonDisplayedCompWithNickname, 'button13');
                    ps.siteAPI.activateModeById(this.pageContainerId, this.pageId, this.testModeId);
                    componentsCode.generateNicknamesForSite(ps);

                    ps.siteAPI.deactivateModeById(this.pageContainerId, this.pageId, this.testModeId); // required for getNickname to work
                    expect(componentsCode.getNickname(ps, nonDisplayedCompWithNickname)).toEqual('button13');
                    expect(componentsCode.getNickname(ps, pageCompWithoutNickname)).toEqual('button14');
                });

                it('should consider existing nicknames of components which are not displayed in any page, when generating nicknames for the master page', function () {
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.fullSiteData);
                    var pagePointer = getDesktopPagePointer(ps, this.pageId);
                    var masterPagePointer = getDesktopPagePointer(ps, this.masterPageId);
                    var nonDisplayedCompWithNickname = ps.pointers.components.getComponent(this.pageNonDisplayedCompId, pagePointer);
                    var masterPageCompWithoutNickname = ps.pointers.components.getComponent(this.dummyMasterPageCompId, masterPagePointer);

                    componentsCode.setNickname(ps, nonDisplayedCompWithNickname, 'button22');
                    ps.siteAPI.activateModeById(this.pageContainerId, this.pageId, this.testModeId);
                    componentsCode.generateNicknamesForSite(ps);

                    ps.siteAPI.deactivateModeById(this.pageContainerId, this.pageId, this.testModeId); // required for getNickname to work
                    expect(componentsCode.getNickname(ps, nonDisplayedCompWithNickname)).toEqual('button22');
                    expect(componentsCode.getNickname(ps, masterPageCompWithoutNickname)).toEqual('button24'); // button23 is set for the dummyPageComp in testPage
                });

            });

        });
    });
});
