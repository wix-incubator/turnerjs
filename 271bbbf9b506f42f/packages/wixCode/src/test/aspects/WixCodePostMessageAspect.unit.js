define([
	'lodash',
	'testUtils',
    'wixCode/aspects/wixCodePostMessageService',
	'wixCode/aspects/WixCodePostMessageAspect'
], function (_, testUtils, wixCodePostMessageService, WixCodePostMessageAspect) {
	'use strict';

	describe('WixCodePostMessageAspect', function () {

		it('should call the registerMessageHandler and registerMessageModifier service methods when it is instantiated', function () {
            spyOn(wixCodePostMessageService, 'registerMessageHandler');
            spyOn(wixCodePostMessageService, 'registerMessageModifier');
            var siteAPI = testUtils.mockFactory.mockSiteAPI();

            new WixCodePostMessageAspect(siteAPI); // eslint-disable-line no-new

            expect(wixCodePostMessageService.registerMessageHandler).toHaveBeenCalledWith(siteAPI, wixCodePostMessageService.handleMessage);
            expect(wixCodePostMessageService.registerMessageModifier).toHaveBeenCalledWith(siteAPI, wixCodePostMessageService.modifyPostMessage);
		});
	});
});
