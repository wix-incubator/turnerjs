define(['lodash', 'react', 'utils', 'core', 'reactDOM'], function(_, React, /** utils */ utils, /** core */ core, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;

    function getNonEmptyText(text) {
        text = text && text.trim();
        return text || '\u00A0';
    }


    /**
     * @class components.MenuButton
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'MenuButton',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],

        getInitialState: function () {
            return {
                $container: this.props.isContainer ? "drop" : "menu",
                $selected: this.props.isSelected ? "selected" : "",
                $state: "idle",
                $type: this.props.compData.link ? 'link' : 'header',
                $mobile: (this.props.siteData.isMobileDevice() || this.props.siteData.isMobileView() || this.props.siteData.isTabletDevice()) ? "mobile" : "notMobile"
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState({
                '$selected': nextProps.isSelected ? "selected" : ""
            });
        },

        getSkinProperties: function () {
            var compData = this.props.compData;
            var alignText = this.props.compProp.alignText;
            var replaceParent = {
                parentConst: React.DOM.a,
                style: _.merge(this.props.style || {}, {
                    display: this.props.display,
                    position: "relative",
                    "boxSizing": "border-box",
                    color: 'grey'
                }),
                onClick: this.onMouseClick,
                "data-listposition": this.props.positionInList
            };
            if (this.state.$mobile !== 'mobile') {
                _.assign(replaceParent, {
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave
                });
            }
            if (compData.link) {
                _.merge(replaceParent, compData.link.render);
            }
            return {
                "": replaceParent,
                bg: {
                    style: {textAlign: alignText}
                },
                label: {
                    children: getNonEmptyText(compData.label),
                    dir: this.props.dir,
                    style: {lineHeight: utils.style.unitize(this.props.lineHeight), textAlign: alignText}
                }
            };
        },
        onMouseEnter: function () {
            if (this.props.compData.link || this.props.refInParent === "__more__") {
                this.setState({$state: "over"});
            }
            var menuBtnDomNode = ReactDOM.findDOMNode(this);
            this.props.mouseEnterHandler(this.props.refInParent, menuBtnDomNode.getAttribute("data-listposition"));
        },
        onMouseLeave: function () {
            if (this.props.isDropDownButton) {
                this.setIdleState();
            }
            this.props.mouseLeaveHandler(this.props.refInParent);
        },
        onMouseClick: function (event) {
            if (this.state.$mobile !== 'notMobile') {
                this.props.onMouseClick(event, this.props.refInParent, this.props.isDropDownButton);
            }
        },

        setIdleState: function () {
            this.setState({$state: "idle"});
        }

    };
});
