define(['lodash', 'wixappsCore/util/textClipper'], function (_, textClipper) {
    'use strict';

    describe("text clipper test:", function () {

        it("should clip when maxChars is smaller than chars on simple text", function () {
            var text = "<p class='font_8>Clip me baby</p>";
            expect(textClipper.clipText(text, 7)).toEqual("<p class='font_8>Clip me...</p>");
        });

        it("should not clip when maxChars is smaller than chars on simple text", function () {
            var text = "<p class='font_8>Clip me baby</p>";
            expect(textClipper.clipText(text, 50)).toEqual("<p class='font_8>Clip me baby</p>");
        });

        it("should clip with multiple tags and no space", function () {
            var text = "<p class='font_8><hatul class='font_8'><span>Clip me baby</span></hatul></p>";
            expect(textClipper.clipText(text, 7)).toEqual("<p class='font_8><hatul class='font_8'><span>Clip me...</span></hatul></p>");
        });

        it("should clip with multiple tags with space", function () {
            var text = "<p class='font_8> <hatul class='font_8'> <span>Clip me baby</span> </hatul> </p>";
            expect(textClipper.clipText(text, 6)).toEqual("<p class='font_8> <hatul class='font_8'> <span>Clip...</span></hatul></p>");
        });

        it("should clip with multiple tags inbetween", function () {
            var text = "<p class='font_8><hatul class='font_8'>Clip me baby please you <span style='font-weight: bold'>know</span> i hate</hatul> tags</p>";
            expect(textClipper.clipText(text, 26)).toEqual("<p class='font_8><hatul class='font_8'>Clip me baby please you <span style='font-weight: bold'>kn...</span></hatul></p>");
        });

        it("should not clip with multiple tags inbetween if max chars is bigger", function () {
            var text = "<p class='font_8><hatul class='font_8'>Clip me baby please you <span style='font-weight: bold'>know</span> i hate</hatul> tags</p>";
            expect(textClipper.clipText(text, 300)).toEqual("<p class='font_8><hatul class='font_8'>Clip me baby please you <span style='font-weight: bold'>know</span> i hate</hatul> tags</p>");
        });

        it("&nbsp; should be treated as white space", function () {
            var text = "<p>Fuck&nbsp; yo&nbsp;mama&nbsp;and&nbsp;papa&nbsp;</p>";
            expect(textClipper.clipText(text, 15)).toEqual("<p>Fuck&nbsp; yo&nbsp;mama&nbsp;a...</p>");
        });

        it("<br> should not have a closing tag 1", function () {
            var text = "<p><br><br></p>";
            expect(textClipper.clipText(text, 4)).toEqual("<p><br><br></p>");
        });

        it("<br/> should not have a closing tag 2", function () {
            var text = "<p><br/><br/></p>";
            expect(textClipper.clipText(text, 4)).toEqual("<p><br/><br/></p>");
        });

        it("should trim trailing spaces 1", function () {
            var text = "<p>Fuck yo  mama</p>";
            expect(textClipper.clipText(text, 9)).toEqual("<p>Fuck yo...</p>");
        });

        it("should trim trailing spaces 2", function () {
            var text = "<p>Fuck&nbsp; yo&nbsp; mama</p>";
            expect(textClipper.clipText(text, 9)).toEqual("<p>Fuck&nbsp; yo...</p>");
        });

        it("should trim trailing spaces and should not trim leading spaces", function () {
            var text = "<p>Fuck<br> yo mama</p>";
            expect(textClipper.clipText(text, 8)).toEqual("<p>Fuck<br> yo...</p>");
        });

        it("should treat special html chars as if they had length 1", function () {
            var text = "<p>&lt;123456789</p>";
            expect(textClipper.clipText(text, 1)).toEqual("<p>&lt;...</p>");
        });

    });

});