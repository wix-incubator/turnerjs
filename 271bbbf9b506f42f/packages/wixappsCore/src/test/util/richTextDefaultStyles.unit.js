define(['lodash', 'wixappsCore/util/richTextDefaultStyles'], function (_, richTextDefaultStyles) {
    'use strict';

    describe('richTextDefaultStyles', function () {
        it('color - custom color', function () {
            var element = richTextDefaultStyles.color("#ffffff");

            var expected = {name: 'span', attributes: [{name: "style", value: "color:#ffffff;"}]};

            expect(element).toEqual(expected);
        });
        it('color - predefined color', function () {
            var element = richTextDefaultStyles.color("someColor");

            var expected = {name: 'span', attributes: [{name: "class", value: "someColor"}]};

            expect(element).toEqual(expected);
        });
        it('bold', function () {
            var element = richTextDefaultStyles.bold(true);

            var expected = {name: 'strong', attributes: [{name: "style", value: "font-weight: bold;"}]};

            expect(element).toEqual(expected);
        });
        it('italic', function () {
            var element = richTextDefaultStyles.italic(true);

            var expected = {name: 'em', attributes: [{name: "style", value: "font-style: italic;"}]};

            expect(element).toEqual(expected);
        });
        it('lineThrough', function () {
            var element = richTextDefaultStyles.lineThrough(true);

            var expected = {name: 'strike', attributes: [{name: "style", value: "text-decoration: line-through;"}]};

            expect(element).toEqual(expected);
        });
        it('underline', function () {
            var element = richTextDefaultStyles.underline(true);

            var expected = {name: 'u', attributes: [{name: "style", value: "text-decoration: underline;"}]};

            expect(element).toEqual(expected);
        });

        it('bold false', function () {
            var element = richTextDefaultStyles.bold(false);

            var expected = {name: 'strong', attributes: [{name: "style", value: "font-weight: normal;"}]};

            expect(element).toEqual(expected);
        });
        it('italic false', function () {
            var element = richTextDefaultStyles.italic(false);

            var expected = {name: 'em', attributes: [{name: "style", value: "font-style: normal;"}]};

            expect(element).toEqual(expected);
        });
        it('lineThrough false', function () {
            var element = richTextDefaultStyles.lineThrough(false);

            var expected = {name: 'strike', attributes: [{name: "style", value: "text-decoration: none;"}]};

            expect(element).toEqual(expected);
        });
        it('underline false', function () {
            var element = richTextDefaultStyles.underline(false);

            var expected = {name: 'u', attributes: [{name: "style", value: "text-decoration: none;"}]};

            expect(element).toEqual(expected);
        });
    });
});
