define(['lodash', 'dataFixer/plugins/textSecurityFixer'], function(_, textSecurityFixer) {
    'use strict';


    describe("text security fixer", function(){
        beforeEach(function () {
            this.page = {

                structure: {
                    id: 'page',
                    components:[],
                    layout: {height: 100, y: 0}
                },
                data : {
                    document_data : {
                        textData: {
                            type: 'StyledText'
                        }
                    },
                    theme_data: {},
                    component_properties: {},
                    links_data: {}
                }
            };
        });

        describe('When text field is undefined', function() {
            it('Should change nothing and pass', function() {
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toBeUndefined();
            });
        });

        describe("When <object> tag is present in html text", function(){

            it("should remove <object> tags", function(){
                this.page.data.document_data.textData.text = '<object cotype="cs" type="cosymantecnisbfw"></object>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });

            it("should remove <object> and keep wrapping structure", function(){
                this.page.data.document_data.textData.text = '<div><object cotype="cs" type="cosymantecnisbfw"></object>ABC</div>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('<div>ABC</div>');
            });

            it("should remove text inside <object> tags", function(){
                this.page.data.document_data.textData.text = '<object cotype="cs" type="cosymantecnisbfw">TEXT</object>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });
        });

        describe("When <object> tag is missing", function(){
            it("should stay the same html", function(){
                var someHtmlText = '<p>Iblah blah</p>' + '<p><br></p>' + '<h5>More text here.</h5><p><br></p><p>&lt;script&gt; slkdjflskd&lt;/script&gt;</p><p><br></p>';
                this.page.data.document_data.textData.text = someHtmlText;
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual(someHtmlText);
            });
        });

        describe('When <img> tag has event handlers', function () {

            it('Should remove the <img> tag when onerror is present', function () {
                this.page.data.document_data.textData.text = '<img src="#" href="sdf s" onerror="top.location=\'htasfsfcascasfP\'"/>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });

            it('Should remove the <img> tag when onload is present', function () {
                this.page.data.document_data.textData.text = '<img src="#" href="sdf s" onload="top.location=\'hasfasdfsdvsdgP\'"/>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });

            it('Should remove the <img> tag when not self closing and has no closing tag', function () {
                this.page.data.document_data.textData.text = '<img src="#" href="sdf s" onload="top.location=\'hasgdsdgfsdP\'">';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });

            it('Should remove the <img> tag when not self closing and has closing tag', function () {
                this.page.data.document_data.textData.text = '<img src="#" href="sdf s" onload="top.location=\'efgsfdsdfgsdgv\'"></img>';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('');
            });
        });

        describe('When <img> tag doesn\'t have event hanslers', function () {

            it('Should leave the <img> tag intact', function () {
                this.page.data.document_data.textData.text = '<img src="#" href="sdf s" >';
                textSecurityFixer.exec(this.page);
                expect(this.page.data.document_data.textData.text).toEqual('<img src="#" href="sdf s" >');
            });
        });
    });

});
