define([
        'lodash',
        'utils',
        'components/components/grid/core/enums'
    ],
    function (_, utils, enums) {
        'use strict';

        var wixLinkRenderer = utils.linkRenderer;
        var dateTimeUtils = utils.dateTimeUtils;
        var FieldType = enums.FieldType;
        var CellRenderers = {
            byFieldType: {}
        };

        function convertImageUrlToStatic (mediaToStaticUrlConverter, url, width, height) {
            var mediaUriRegex = /^image:\/\//;
            if (mediaUriRegex.test(url)) {
                var srcRegx = /^image:\/\/([^\/]*)\/([^\/]*)\/([^\/]*)\/([^\/]*)/;
                var match = url.match(srcRegx);
                var version = match[1];
                var fileName = match[2];
                var prettyName = match[4];
                var staticUrl = mediaToStaticUrlConverter(fileName) +
                    '/' + version + '/fit/w_' + width + ',h_' + height + '/' + prettyName;
                return staticUrl;
            }
            return url;
        }

        function emptyDataFallback (renderer, params) {
            if (_.isUndefined(params.value.data)) { return ''; }
            return renderer(params);
        }

        function wrapInCellTextDiv (html) {
            var innerHTML = html && html.outerHTML ? html.outerHTML : html;
            var cellContentDiv = window.document.createElement('div');
            cellContentDiv.className = 'ag-cell-text';
            cellContentDiv.innerHTML = innerHTML;
            return cellContentDiv;
        }

        CellRenderers.linkRenderer = function (contentRenderer, linkRenderInfo, rootNavigationInfo) {
            return function (params) {
                var a = window.document.createElement('a');
                var content = contentRenderer(params);
                a.innerHTML = content && content.outerHTML ? content.outerHTML : content;
                var wixLink = wixLinkRenderer.renderLink(params.value.link, linkRenderInfo, rootNavigationInfo);
                _.assign(a, wixLink);
                return a;
            };
        };

        CellRenderers.valueRenderer = function (params) {
            return wrapInCellTextDiv(_.get(params, 'value.data'));
        };

        CellRenderers.byFieldType[FieldType.DATE] = function (props) {
            var dateFormat = props.compProp.dateFormat;
            return function (params) {
                var date = new Date(params.value.data);
                var dateString = dateTimeUtils.dateFormat(date, dateFormat);
                return wrapInCellTextDiv(dateString);
            };
        };

        CellRenderers.byFieldType[FieldType.IMAGE] = function (props) {
            var mediaToStaticUrlConverter = props.getMediaFullStaticUrl;
            return function (params) {
                var width = params.column.actualWidth;
                var height = params.node.rowHeight;
                var url = convertImageUrlToStatic(mediaToStaticUrlConverter, params.value.data, width, height);

                return '<img class="ag-cell-image" src="' + url + '">';
            };
        };

        CellRenderers.byFieldType[FieldType.BOOLEAN] = _.partial(_.identity, function (params) {
            return wrapInCellTextDiv(params.value.data ? 'Yes' : 'No');
        });

        CellRenderers.byFieldType[FieldType.RICH_TEXT] = _.partial(_.identity, function (params) {
            return '<div class="ag-cell-richtext">' + params.value.data + '</div>';
        });

        CellRenderers.get = function (fieldType, props) {
            var renderer;
            if (_.has(CellRenderers.byFieldType, fieldType)) {
                renderer = CellRenderers.byFieldType[fieldType](props);
            } else {
                renderer = CellRenderers.valueRenderer;
            }
            return _.wrap(renderer, emptyDataFallback);
        };

        return CellRenderers;
    }
);
