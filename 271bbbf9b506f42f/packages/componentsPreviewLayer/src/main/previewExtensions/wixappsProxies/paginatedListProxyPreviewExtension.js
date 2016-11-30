define([
    'lodash',
    'previewExtensionsCore'
], function (
    _,
    previewExtensionsCore
) {
    'use strict';

    var paginatedListPreviewExtension = {
        componentDidUpdate: function () {
            this._itemsPerPage = getItemsPerPage.call(this);
        },

        componentWillReceiveProps: function () {
            if (this.state.currentPage > 1 && itemsPerPageHasChanged.call(this)) {
                this.setState({currentPage: 1});
            }
        }
    };

    previewExtensionsCore.registrar.registerProxyExtension('PaginatedList', paginatedListPreviewExtension);

    function getItemsPerPage() {
        return this.getCompProp('itemsPerPage');
    }

    function itemsPerPageHasChanged() {
        return this._itemsPerPage && this._itemsPerPage !== getItemsPerPage.call(this);
    }
});
