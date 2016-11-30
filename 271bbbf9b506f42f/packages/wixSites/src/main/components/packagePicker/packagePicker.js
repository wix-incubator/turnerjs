/**
 * Created by alexandergonchar on 7/28/14.
 */
define(["lodash", "react", "core", "skins", "utils"], function (_, React, /** core */core, skinsPackage, utils) {
    'use strict';

    var ajaxLib = utils.ajaxLibrary;

    var pageViewBiEventWasSent = false;

    var toolTipId = "tooltip";


    function sendPageViewBIEvent () {
        //TODO: should be moved to utils

        var params = this.props.siteData.currentUrl.query,
            eventImg = window.document.createElement('img'),
            referral = params.referrer || '',
            strList;

        if (params.siteGuid && params.referralAdditionalInfo) {

            strList = [
                    'http://frog.wix.com/pre?evid=168',
                    '&msid=', params.siteGuid,
                    '&origin=', params.referralAdditionalInfo,
                    '&ref=', referral
                ];

            eventImg.src = strList.join('');

            window.document.body.appendChild(eventImg);
        }
    }

    function getImgProps() {
        return this.props.compData.buttonImageUrl ?
            {src: this.props.siteData.serviceTopology.staticMediaUrl + '/' + this.props.compData.buttonImageUrl} :
            { };
    }

    function requestComplete(data) {
        if (!!data && data.resultType === 'SUCCESS_NEW_PURCHASE' && data.url) {
            window.location.assign('https://premium.wix.com/wix/api/' + data.url);
        } else {

            // TODO send an error bi event

            window.location.replace('http://wix.com/upgrade/website' + window.location.search);
        }
    }

    function sendRequest() {
        var params = this.props.siteData.currentUrl.query,
            data = this.props.compData;

        ajaxLib.get(
            '_api/wix/wixPackagePickerSubmit',
            {
                paymentcycle: data.billingCycle.toLocaleUpperCase(),
                siteGuid: params.siteGuid,
                productid: data.packageId,
                referral: params.referrer
            },
            requestComplete
        );
    }

    function shouldShowToolTip() {
        return !utils.stringUtils.isNullOrEmpty(this.props.compData.tooltipText);
    }


    return {
        displayName: 'PackagePicker',
        mixins: [core.compMixins.skinBasedComp],

        select: function () {
            this.props.siteAPI.getSiteAspect('PackagePickerAspect').setSelected(this);
        },

        onActionClicked: function (e) {
            e.preventDefault();
            this.select();
        },

        onBuyActionClicked: function (e) {
            e.preventDefault();
            sendRequest.call(this);
        },

        onMouseEnter: function () {
            if (shouldShowToolTip.call(this)) {
                this.refs.tooltip.showToolTip({}, {source: this.refs.tooltipArea});
            }
        },

        onMouseLeave: function () {
            if (shouldShowToolTip.call(this)) {
                this.refs.tooltip.closeToolTip();
            }
        },


        createInfoTipChildComponent: function (area) {
            if (!shouldShowToolTip.call(this)) {
                return null;
            }

            return this.createChildComponent(
                {
                    content: this.props.compData.tooltipText,
                    id: toolTipId
                },
                'wysiwyg.common.components.InfoTip',
                'tooltip',
                {
                    ref: toolTipId,
                    currentUrlPageId: this.props.currentUrlPageId,
                    className: this.props.styleId + "tooltip",
                    area: area,
                    siteAPI: this.props.siteAPI
                }
            );
        },

        getSkinProperties: function () {
            var savedCheckedState = this.props.siteAPI.getSiteAspect('PackagePickerAspect').isPackagePickerSelected(this),
                checkState = savedCheckedState === undefined ? this.props.compData.selectByDefault : savedCheckedState,
                buttonTopOffset = this.props.compProp.buttonTopOffset || this.props.compData.buttonTopOffset || 0,
                radioButtonGap = this.props.compProp.radioButtonGap || 0,
                toolTip = this.createInfoTipChildComponent();

            return {
                "": {
                    onMouseEnter: this.onMouseEnter,
                    onMouseLeave: this.onMouseLeave
                },
                radioElement: {
                    children: React.DOM.input({
                        type: 'radio',
                        checked: checkState,
                        onChange: _.noop
                    }),
                    style: {
                        top: buttonTopOffset + 'px'
                    }
                },
                buyaction: {
                    onClick: this.onBuyActionClicked
                },
                actionButton: {
                    style: {
                        display: savedCheckedState ? 'block' : 'none',
                        top: (buttonTopOffset + 20 + radioButtonGap) + 'px'
                    }
                },
                img: getImgProps.call(this),
                linkForRadio: {
                    onClick: this.onActionClicked
                },
                buyAction: {
                    onClick: this.onBuyActionClicked
                },
                tooltip: toolTip,
                additionalChildren: [toolTip]
            };
        },

        getInitialState: function () {
            // the only state value is stored via PackagePickerAspect
            return {
            };
        },

        componentDidMount: function () {
            if (!pageViewBiEventWasSent) {
                pageViewBiEventWasSent = true;
                sendPageViewBIEvent.call(this);
            }
        }
    };
});
