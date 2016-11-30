define(['lodash'], function(_) {
  'use strict';

  var fixPinterestUrl = function(dataNode) {
    var url = 'www.pinterest.com/';
    dataNode.urlChoice = _.includes(dataNode.urlChoice, 'pinterest.com') ? dataNode.urlChoice : url + dataNode.urlChoice;
  };

  /**
   * @exports utils/dataFixer/plugins/pinterestFollowFixer
   * @type {{exec: exec}}
   */
  var exports = {
    exec: function(pageJson) {
      return _(pageJson.data.document_data)
          .pick(function (dataNode) {
            return dataNode.type === 'PinterestFollow';
          })
          .mapValues(fixPinterestUrl)
          .value();
    }
  };

  return exports;
});


