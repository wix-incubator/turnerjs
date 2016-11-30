/**
 * Created by Shaharz on 11/18/13.
 */
describe('SaveCommandRegistrar - MobileBgPreset', function(){
    testRequire()
        .resources('W.Editor', 'W.Preview', 'W.Commands', 'W.Theme');

    beforeEach(function(){
        this._saveCommandRegistrar = this.W.Editor._commandRegistrar._saveCommandRegistrar;
        spyOn(W.Preview, 'getPreviewManagers').andReturn(W);
        spyOn(this.W.Preview, 'isSiteReady').andReturn(true);
    });

    it("should add mobileBg meta tag in case mobile BG is split from desktop BG", function(){
        spyOn(this._saveCommandRegistrar, '_isMobileBgSplitFromDesktop').andReturn(true);

        this.W.Commands.executeCommand("WEditorCommands.SaveAsTemplate");

        expect(this.W.Theme.getDataItem().get('themePresets')).toEqual({'mobileBg': true});
    });

    it("should not add mobileBg meta tag in case mobile BG points to desktop BG", function(){
        spyOn(this._saveCommandRegistrar, '_isMobileBgSplitFromDesktop').andReturn(false);

        this.W.Commands.executeCommand("WEditorCommands.SaveAsTemplate");

        expect(this.W.Theme.getDataItem().get('themePresets')).toEqual({});
    });
});
