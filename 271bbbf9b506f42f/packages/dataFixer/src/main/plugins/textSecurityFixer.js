define(['lodash'], function(_){
    'use strict';

    var textTypes = ['RichText', 'Text', 'StyledText', 'MediaRichText'];

    function fixTextNodes(dataMap) {
        return _(dataMap)
          .pick(function (dataNode) {
              return _.includes(textTypes, dataNode.type);
          })
          .mapValues(function (textData) {
              textData.text = removeObjectElements(textData.text);
              textData.text = removeImgElementsWithEventHandlers(textData.text);
              return textData;
          })
          .value();
    }

    function removeObjectElements (html) {
        return html && html.replace(/(<object[^>]*>)(.*?)(<\/object>)/gi, '');
    }

    function removeImgElementsWithEventHandlers (html) {
        return html &&
          html.replace(/<img[^>]*(onerror|onload|onmouseenter|onmousemove|onmouseleave|onmouseover|onmouseup|onmouseout)[^>]*\/?>(<\/img>)?/gi, '');
    }



    /**
     * @exports utils/dataFixer/plugins/objectTagTextSecurityFixer
     */
    var exports = {
        exec: function(pageJson){
            var data = pageJson.data.document_data;
            if (data){
                fixTextNodes(data);
            }
        }
    };

    return exports;
});
