define(['lodash', 'dataFixer/plugins/documentMediaFixer'], function(_, dataFixer) {
  'use strict';

  describe('documentMediaFixer spec', function () {
    function mockComp(){
      return {
        componentType: 'wysiwyg.viewer.components.documentmedia.DocumentMedia',
        dataQuery: '#mockHash',
        id: 'i74mvvxu',
        skin: 'skins.viewer.documentmedia.DocumentMediaSkin',
        type: 'Component'
      };
    }

    function mockCompData(docImageUri) {
      return {
        id: 'mockHash',
        link: '#i58',
        title: 'aba-sign1.pdf',
        type: 'Image',
        uri: docImageUri
      };
    }

    beforeEach(function () {
      this.page = {
        data: {
          component_properties: {},
          document_data: {}
        },
        structure: {
          componentType: 'mobile.core.components.Page',
          components: [],
          type: 'Page'
        }
      };

      this.goodUri = 'dbb8a86ae473275eee143da611a12717.png';
      this.badUri = 'media/dbb8a86ae473275eee143da611a12717.png';
      this.imgSrc = 'static.wixstatic.com/media/';
      this.goodUrl = 'static.wixstatic.com/media/dbb8a86ae473275eee143da611a12717.png';
    });

    it('should do nothing if the image uri is valid', function() {
      this.page.data.document_data.mockHash = mockCompData(this.goodUri);
      this.page.structure.components.push(mockComp());

      dataFixer.exec(this.page);
      expect(this.page.data.document_data.mockHash.uri).toEqual(this.goodUri);
    });

    it('should remove the extra media/ from the uri inside of the comp data', function() {
      this.page.data.document_data.mockHash = mockCompData(this.badUri);
      this.page.structure.components.push(mockComp());

      dataFixer.exec(this.page);
      expect(this.page.data.document_data.mockHash.uri).toEqual(this.goodUri);
    });

    it('should have the right url to the document icon', function() {
      this.page.data.document_data.mockHash = mockCompData(this.badUri);
      this.page.structure.components.push(mockComp());

      dataFixer.exec(this.page);
      var url = this.imgSrc + this.page.data.document_data.mockHash.uri;
      expect(url).toEqual(this.goodUrl);
    });

  });
});
