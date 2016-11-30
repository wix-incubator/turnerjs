describe('FacebookLikeBox', function () {
    testRequire().components('wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox');

    beforeEach(function () {
        this.componentLogic = new this.FacebookLikeBox('testCompId', new Element('div'));
    });

    describe('getSourc - Facebook iframe src', function () {
        beforeEach(function(){
            var data = {
                type: 'FacebookLikeBox',
                facebookPageId: 'wix',
                colorScheme: 'light',
                showFaces: 'true',
                showStream: 'true',
                showBorder: 'true',
                showHeader: 'true'
            };

            data.get = function(key) {
                return data[key];
            };

            spyOn(this.componentLogic, 'getDataItem').andReturn(data);
            spyOn(this.componentLogic, 'getHeight').andReturn(556);
            spyOn(this.componentLogic, 'getWidth').andReturn(300);
        });

        it('should correspond to component\'s data', function () {
            var iframeSource = this.componentLogic.getSource();

            console.log('iframeSource:', iframeSource);

            var expectedSrc = '//www.facebook.com/plugins/likebox.php?href=https://www.facebook.com/wix&colorscheme=light&height=556&width=300&show_faces=true&stream=true&show_border=true&header=true';
            expect(iframeSource).toBe(expectedSrc);
        });
    });

});