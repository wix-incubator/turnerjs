describe("WRichText", function(){
    testRequire().components('wysiwyg.viewer.components.WRichText').
        resources('W.Data', 'W.Css');

    beforeEach(function(){
        var div = new Element('div');
        this._comp = new this.WRichText('mockComp', div);
        var data = this.W.Data.createDataItem({
            'type': 'StyledText',
            'text': ''
        }, 'StyledText');
        this._comp.setDataItem(data);
    });

    describe("_getUsedFontsInComp", function(){
        it("should get all font names from spans", function(){
            this._comp.getDataItem().set('text',
                '<h6>I a para<span style="font-family:times new roman;">graph. Click here to add</span> your own text and edit me. I’m a <span style="font-family:play;">great place for you</span> to tell a story and let your users know a little more about you.?</h6>');

            var fontNames = this._comp._getUsedFontsInComp();
            expect(fontNames['times new roman']).toBeTruthy();
            expect(fontNames['play']).toBeTruthy();
            expect(Object.keys(fontNames).length).toBe(2);
        });

        it("should ignore spans without style attribute", function(){
            this._comp.getDataItem().set('text',
                '<h6>I a para<span>graph. Click here to add</span> </h6>');

            var fontNames = this._comp._getUsedFontsInComp();
            expect(Object.keys(fontNames).length).toBe(0);
        });
        it("should ignore spans without font family defined", function(){
            this._comp.getDataItem().set('text',
                '<h6>I a para<span style="color:red;">graph. Click here to add</span> </h6>');

            var fontNames = this._comp._getUsedFontsInComp();
            expect(Object.keys(fontNames).length).toBe(0);
        });
        //chrome sometimes creates them
        it("should get all font names from font tags", function(){
            this._comp.getDataItem().set('text',
                '<h6><font face="times new roman">aksjd hfksajd hfkasjd hfadsj hfkjfds&nbsp;</font></h6>');

            var fontNames = this._comp._getUsedFontsInComp();
            expect(fontNames['times new roman']).toBeTruthy();
            expect(Object.keys(fontNames).length).toBe(1);
        });
        it("should combine font names from both spans and font tags", function(){
            this._comp.getDataItem().set('text',
                '<h6><font face="times new roman">aksjd hfksajd hfkasjd hfadsj hfkjfds&nbsp;</font></h6><span style="font-family:play;">great place for you</span>');

            var fontNames = this._comp._getUsedFontsInComp();
            expect(fontNames['times new roman']).toBeTruthy();
            expect(fontNames['play']).toBeTruthy();
            expect(Object.keys(fontNames).length).toBe(2);
        });

    });
});