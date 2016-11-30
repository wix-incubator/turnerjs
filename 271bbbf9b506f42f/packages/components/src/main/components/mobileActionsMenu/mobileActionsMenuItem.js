define(['react', 'utils'], function (React, utils) {
    'use strict';

    var MobileActionsMenuItem = React.createClass({
        displayName: 'MobileActionsMenuItem',
        render: function () {
            var selectedClassSet = {};
            selectedClassSet[this.props.styleId + "_selected"] = this.props.isSelected;
            selectedClassSet[this.props.styleId + "_subItem"] = this.props.level > 1;
            selectedClassSet[this.props.styleId + "_hasChildren"] = this.props.hasChildren;
            var href = "#";
            if (this.props.target === "page"){
                href = this.props.href;
            } else if (this.props.target === null){
                href = "";
            }


            return React.DOM.li(
                {
                    onClick: this.onItemClick
                },
                React.DOM.a({
                        href: href,
                        "data-anchor": this.props["data-anchor"],
                        className: utils.classNames(selectedClassSet)
                    },
                    (this.props.level > 1) ? "> " + this.props.label : this.props.label
                )
            );
        },

        onItemClick: function () {
            if (this.props.target === "window") {
                this.props.siteAPI.openPopup(this.props.href);
            } else if (this.props.target === "page"){
                this.props.closeMenu();
            }
        }
    });

    return MobileActionsMenuItem;
});
