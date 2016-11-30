define(['skintest!wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkin'], function(skinData){
	"use strict";

	describe("enterPasswordDialogSkin test", function() {

		describe('Wrapper div', function() {

			// #CLNT-1360
			it('Should have 12px left/right padding in mobile view', function() {
				expect(skinData.css['[data-state~="mobile"] .wrapper'].padding).toEqual('10px 12px');
			});

		});

	});
});
