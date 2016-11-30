describe('RTShadowDD', function(){
    testRequire().
        classes('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownShadowCommand');

    describe('compare css "text-shadow" cross browsers compare', function() {
        it('should return true for same string', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)")).
                toBeTruthy();
        });

        it('should return true strings with different rgba order', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "rgba(255, 255, 255, 0.6) 1px 1px 1px, rgba(0, 0, 0, 0.6) -1px -1px 1px")).
                toBeTruthy();
        });

        it('should return equal for strings with extra spaces', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "1px 1px 1px rgba(255,255,255,0.6), -1px -1px 1px rgba(0,0,0,0.6)")).
                toBeTruthy();
        });

        it('should return equal for strings with extra spaces and different rgba order', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "rgba(255, 255, 255, 0.6) 1px 1px 1px, rgba(0, 0, 0, 0.6) -1px -1px 1px")).
                toBeTruthy();
        });

        it('should return equal for strings with extra spaces and different rgba order and different alpha value', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "rgba(0, 0, 0, 0.498039) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px -1px 0px",
                    "-1px -1px 0px rgba(0, 0, 0, 0.498), -1px 1px 0px rgba(0, 0, 0, 0.498), 1px 1px 0px rgba(0, 0, 0, 0.498), 1px -1px 0px rgba(0, 0, 0, 0.498)")).
                toBeTruthy();
        });

        it('should return equal for css strings with extra spaces and different rgba order and different alpha value', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "0px 0px 6px #ffffff",
                    "rgb(255, 255, 255) 0px 0px 6px")).
                toBeTruthy();
            expect(
                shadowDD._cssTextShadowCompare(
                    "rgb(200, 200, 200) 1px 1px 0px, rgb(180, 180, 180) 0px 2px 0px, rgb(160, 160, 160) 0px 3px 0px, rgba(140, 140, 140, 0.498039) 0px 4px 0px, rgb(120, 120, 120) 0px 0px 0px, rgba(0, 0, 0, 0.498039) 0px 5px 10px",
                    "1px 1px 0px #c8c8c8, 0px 2px 0px #b4b4b4, 0px 3px 0px #a0a0a0, 0px 4px 0px rgba(140,140,140,0.498039), 0px 0px 0px #787878, 0px 5px 10px rgba(0,0,0,0.498039)")).
                toBeTruthy();
        });

        it('should return false when the css shadow values do not match', function(){
            spyOn(this.RTDropDownShadowCommand.prototype, 'initialize');

            var shadowDD = new this.RTDropDownShadowCommand();
            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 1px 1px rgba(255, 255, 200, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "1px 1px 1px rgba(255, 255, 255, 0.6), -1px -1px 2px rgba(0, 0, 0, 0.6)")).
                toBeFalsy();

            expect(
                shadowDD._cssTextShadowCompare(
                    "1px 2px 1px rgba(255, 255, 255, 0.6), -1px -1px 1px rgba(0, 0, 0, 0.6)",
                    "rgba(255, 255, 255, 0.6) 1px 1px 1px, rgba(0, 0, 0, 0.6) -1px -1px 1px")).
                toBeFalsy();

            expect(
                shadowDD._cssTextShadowCompare(
                    "rgba(0, 0, 0, 0.23) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px -1px 0px",
                    "-1px -1px 0px rgba(0, 0, 0, 0.498), -1px 1px 0px rgba(0, 0, 0, 0.498), 1px 1px 0px rgba(0, 0, 0, 0.498), 1px -1px 0px rgba(0, 0, 0, 0.498)")).
                toBeFalsy();

            expect(
                shadowDD._cssTextShadowCompare(
                    "rgba(0, 0, 0, 0.23) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px -1px 0px",
                    "rgba(0, 0, 0, 0.23) -1px -1px 0px, rgba(0, 0, 0, 0.498039) -1px 1px 0px, rgba(0, 0, 0, 0.498039) 1px 1px 0px")).
                toBeFalsy();
        });
    });
});
