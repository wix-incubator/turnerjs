define(['react', 'reactDOM', 'core', 'utils'], function(React, ReactDOM, /** core */ core, /** utils */ utils) {
    'use strict';

    var mixins = core.compMixins;
    var urlUtils = utils.urlUtils;

    var siteIdMap = {
        'Australia': '15',
        'Austria': '16',
        'Belgium_Dutch': '123',
        'Belgium_French': '23',
        'Canada': '2',
        'CanadaFrench': '210',
        'China': '223',
        'eBayMotors': '100',
        'France': '71',
        'Germany': '77',
        'HongKong': '201',
        'India': '203',
        'Ireland': '205',
        'Italy': '101',
        'Malaysia': '207',
        'Netherlands': '146',
        'Philippines': '211',
        'Poland': '212',
        'Singapore': '216',
        'Spain': '186',
        'Sweden': '218',
        'Switzerland': '193',
        'Taiwan': '196',
        'UK': '3',
        'US': '0'
    };

    var staticUrlParams = {
        'EKServer': '',
        "ai": "aj|kvpqvqlvxwkl",
        "cid": "0",
        "eksize": "1",
        "encode": "UTF-8",
        "endcolor": "FF0000",
        "endtime": "y",
        "fbgcolor": "FFFFFF",
        "fs": '0',
        'hdrsrch': 'n',
        "img": "y",
        "logo": "6",
        "numbid": "n",
        "paypal": "n",
        "popup": "y",
        "prvd": "9",
        "r0": "3",
        "shipcost": "y",
        "sort": "MetaEndSort",
        "sortby": "endtime",
        "sortdir": "asc",
        "srchdesc": "n",
        "title": '',
        "tlecolor": 'FFFFFF',
        "tlefs": "0",
        "tlfcolor": "000000",
        "toolid": "10004",
        "track": "5335838312"
    };

    /**
     * @class components.ebayItemsBySeller
     * @extends {core.skinBasedComp}
     * @extends {core.skinInfo}
     */
    return {
        displayName: 'EbayItemsBySeller',
        mixins: [mixins.skinBasedComp, mixins.skinInfo],
        getScriptUrl: function () {
            var baseUrl = 'http://lapi.ebay.com/ws/eBayISAPI.dll',
                options = this._prepareOptions();

            return baseUrl + '?' + urlUtils.toQueryString(staticUrlParams) + '&' + urlUtils.toQueryString(options);
        },
        getSkinProperties: function () {
            var iframe,
                compLayout = this.props.structure.layout,
                isIe = this.props.siteData.getBrowser().ie,
                iframeSrc;

            if (!isIe) {
                iframeSrc = 'data:text/html,<html><body style="margin:0px;"><div><script src="' + this.getScriptUrl() + '"></script></div></body></html>';
            }

            if (this.props.compData.sellerId) {
                iframe = React.DOM.iframe({
                    src: isIe ? '' : encodeURI(iframeSrc),
                    style: {
                        width: compLayout.width,
                        height: compLayout.height
                    }
                });

            }
            return {
                "iFrameHolder": {
                    children: this.props.compData.sellerId ? [iframe] : []
                }
            };
        },
        getInitialState: function () {
            return {
                '$contentState': this.props.compData.sellerId ? 'hasContent' : 'noContent'
            };
        },
        componentDidMount: function () {
            if (!this.props.compData.sellerId) {
                return;
            }
            var browserData = this.props.siteData.getBrowser();//eslint-disable-line react/no-did-mount-callbacks-from-props
            if (browserData.ie) {
                var iFrameNode = ReactDOM.findDOMNode(this).querySelector("iframe"),
                    frameDoc;
                if (parseInt(browserData.version, 10) === 10){
                    // IE 10 blocks access to iframe document because of domain issues:
                    iFrameNode.src = 'javascript:(function () {' + 'document.open();document.domain=\'' + encodeURIComponent(window.document.domain) + '\';document.close()' + '})();'; //eslint-disable-line no-script-url
                }
                frameDoc = iFrameNode.contentWindow.document;
                frameDoc.write('<html><body style="margin:0px;"><div><script type="text/javascript" src="' + this.getScriptUrl() + '"></script></div></body></html>');

            }
        },
        _prepareOptions: function () {
            var compLayout = this.props.structure.layout;
            // calculate number of items (100 is header and footer, 70 is a single item's height)
            var itemCount = Math.floor((compLayout.height - 100) / 70);
            var id = this.props.compData.sellerId;
            return {
                width: compLayout.width,
                hdrimage: this.props.compProp.headerImage,
                fntcolor: this.getParamFromDefaultSkin("fontColor").value.hexString().replace('#', ''),
                bdrcolor: this.getParamFromDefaultSkin("borderColor").value.hexString().replace('#', ''),
                hdrcolor: this.getParamFromDefaultSkin("headerColor").value.hexString().replace('#', ''),
                tbgcolor: this.getParamFromDefaultSkin("backgroundColor").value.hexString().replace('#', ''),
                lnkcolor: this.getParamFromDefaultSkin("linkColor").value.hexString().replace('#', ''),
                num: itemCount,
                si: id,
                sid: id,
                siteid: siteIdMap[this.props.compData.registrationSite] || 0
            };
        }
    };
});
