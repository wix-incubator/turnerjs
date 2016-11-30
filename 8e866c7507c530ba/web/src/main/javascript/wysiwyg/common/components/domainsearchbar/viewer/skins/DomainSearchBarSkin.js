define.skin('wysiwyg.common.components.domainsearchbar.viewer.skins.DomainSearchBarSkin', function (skinDefinition) {
    /** @type core.managers.skin.SkinDefinition */
    var def = skinDefinition;

    def.inherits('core.managers.skin.BaseSkin2');

    def.iconParams({'description': 'Basic', 'iconUrl': '/images/wysiwyg/skinIcons/xxx.png', 'hidden': false, 'index': 0});

    def.skinParams([
        {'id': 'brw', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '1px'},
        {'id': 'tdr', 'type': Constants.SkinParamTypes.URL, 'defaultTheme': 'BASE_THEME_DIRECTORY'},
        {'id': 'trans', 'type': Constants.SkinParamTypes.TRANSITION, 'defaultValue': 'all 0.4s ease 0s'},
        {'id':'$BorderRadius', 'type':Constants.SkinParamTypes.BORDER_RADIUS, noshow:true, 'defaultValue':'6px'},
        {'id':'$BorderRadiusLeftOnly', 'type':Constants.SkinParamTypes.BORDER_RADIUS, mutators:['square',['tl','bl']], noshow:true, 'defaultParam':'$BorderRadius'}
    ]);

    def.html(
        '<div skinpart="content">' +

            '<div class="topBar">' +

                '<div skinpart="searchDomainContainer">' +

                    //--- FUIE8
                    // Herein lies <form skinpart="frmSearchDomain">
                    // The actual form's HTML is at the bottom of the HTML string, and will be programmatically placed here
                    // when the component renders.
                    // The reason is that the form's inner HTML tree layer (see layer of <input skinpart="txtDomain">)
                    // caused a Stack Overflow alert in IE8
                    // The problem is probably a too-deep HTML string being appended\rendered.

                    // '<form skinpart="frmSearchDomain" action="" method="GET">'
                    //--- FUIE8 END

                    '<div skinpart="loaderOverlay"></div>' +
                    '<div skinpart="loader"></div>' +
                '</div>' +

                '<div skinpart="buyDomainContainer">' +
                    '<div class="availableIcon"></div> ' +
                    '<p skinpart="availableDomainName">test-domain-text.com</p>' +
                    '<p class="availableLabel">is available</p>' +
                    '<div skinpart="availableDomainPrice">$0.99</div> ' +
                    '<a skinpart="btnBuyAvailableDomain">Buy Now</a> ' +
                    '<div skinpart="searchAgain">Search Again</div>' +
                '</div>' +

            '</div>' +

            '<div skinpart="error">The domain yotam.com is not available.</div>' +

            '<div skinpart="alternativeDomainsContainer">' +

                '<p>Check out these available domains:</p>' +

                '<ul skinpart="alternativeDomains"></ul>' + // placeholder

            '</div>' +

            '<form skinpart="frmBuyDomain" method="POST" action="https://premium.wix.com/wix/api/domainDirectPurchaseForm?referralAdditionalInfo=Da_99">' +
                '<input skinpart="txtBuyDomainValue" type="hidden" name="domainName" /> ' +
            '</form>' +

            //--- FUIE8
            // This form should be in the "searchDomainContainer" skinpart above (inside the topBar skinpart)
            // The HTML tree was too deep when this was in its place, and cause a "Stack Overflow at line 0" alert in IE8

            '<form skinpart="frmSearchDomain" action="" method="GET">' +
                '<div class="domainInputWrapper">' +
                    '<input type="text" skinpart="txtDomain" name="txtDomain" autofocus placeholder="Search for the domain you want" value="" />' +
                '</div>' +

                '<div skinpart="suffixSelectionWrapper">' +
                    '<div skinpart="selectedSuffixWrapper">' +
                        '<span skinpart="selectedSuffix" data-value=".com">.com</span>' +
                        '<span class="selectionArrow"></span>' +
                    '</div>' +

                    '<ul skinpart="suffixDropdown">' +
                        '<li data-value=".com">.com</li>' +
                        '<li data-value=".co.uk">.co.uk</li>' +
                        '<li data-value=".biz">.biz</li>' +
                        '<li data-value=".info">.info</li>' +
                        '<li data-value=".org">.org</li>' +
                        '<li data-value=".net">.net</li>' +
                    '</ul>' +
                '</div>' +

                '<div class="searchDomainButtonWrapper">' +
                    '<input type="submit" value="Search" skinpart="searchDomainButton" data-refCode="99" />' +
                '</div>' +

            '</form>' +

            //--- FUIE8 END

        '</div>'
    );

    def.css([
        '%content% { font-family: "Helvetica Neue", "HelveticaNeueW01-55Roma", "HelveticaNeueW02-55Roma", "HelveticaNeueW10-55Roma", Helvetica, Arial, sans-serif; font-size: 21px; }',

        //Image preloading
        ':after { display:none; content:url([tdr]search-btn-hover.png) url([tdr]ajax-loader.gif) url([tdr]yes-icon.png) url([tdr]no-icon.png) url([tdr]buy-button.png) url([tdr]buy-button-hover.png) url([tdr]search-again-arrow.png); }',
        //

        // Top bar
        '%.topBar% { border:[brw] solid #cfcfcf; [$BorderRadius]; background-color: #f5f5f5; height: 115px; }',

        // Search view
        '%searchDomainContainer% { display: none; position: relative; margin: 30px 15px; height: 53px; background-color: white; border:[brw] solid #cfcfcf; [$BorderRadius] }',
        '[state~=topBar-search] %searchDomainContainer% { display: block; }',
        '%frmSearchDomain% { display: none; }', // will be added and displayed when the component is rendered

        // Domain input
        '%.domainInputWrapper% { position:absolute; right:0; bottom:0; left:0; right: 258px; padding: 0 15px; }',
        '%txtDomain% { border: 0; height: 53px; line-height: 49px; font-size: 21px; width: 100% }',
        '[state~=inputPlaceholder-on] %txtDomain% { color: #aaa; }',

        // Suffix dropdown
        '%suffixSelectionWrapper% { position: relative; float: right; margin-right: 174px; width: 82px; border-right: [brw] solid #cfcfcf; border-left: [brw] solid #cfcfcf; line-height: 53px; height: 53px; text-align: center; color: #a9a9a9; cursor: pointer; }',
        '%.selectionArrow% { display: inline-block; background:url([tdr]triangle-selector.png); width: 12px; height: 6px; position: relative; top: -3px; left: 4px; }',
        '%selectedSuffixWrapper%:hover { background-color: #e7f3ff; }',
        '%suffixDropdown% { z-index: 1; height: 0px; [trans]; position: absolute; width: 100%; top: 54px; left: -1px; border-left: [brw] solid #cfcfcf; border-right: [brw] solid #cfcfcf; overflow: hidden; }',
        '[state~=suffixMenu-open] %suffixDropdown% { height: 324px; }',
        '%suffixDropdown% li { display: block; height: 53px; border-bottom: [brw] solid #cfcfcf; background-color: white; }',
        '%suffixDropdown% li:hover { background-color: #e7f3ff; }',

        // Search domain button
        '%.searchDomainButtonWrapper% { position: absolute; right: 0; }',
        '%searchDomainButton% { width: 174px; height: 53px; border: 0; margin: 0; font-size: 24px; color: white; background:url([tdr]search-btn.png); padding: 0; [$BorderRadiusLeftOnly]; cursor: pointer; }',
        '%searchDomainButton%:hover { background:url([tdr]search-btn-hover.png); }',

        // Loader gif
        '%loaderOverlay% { display: none; position: absolute; width: 848px; height: 53px; background-color: white; [$BorderRadius]; opacity: 0.4; position:absolute; top:0; bottom:0; left: 0px; right: 0px; }',
        '%loader% { display: none; background-image: url([tdr]ajax-loader.gif); width: 32px; height: 32px; position: absolute; top: 0; left: 0; right: 0; bottom: 0; margin: auto; }',
        '[state~=loader-on] %loaderOverlay%, [state~=loader-on] %loader% { display: block; }',

        // Buy domain view
        '%buyDomainContainer%{ display: none; position: relative; height: 50px; width: 728px; margin: 33px auto 31px; color: #555555; }',
        '[state~=topBar-buy] %buyDomainContainer% { display: block; }',
        '%.availableIcon%{ display: inline-block; width: 50px; height: 50px; background:url([tdr]yes-icon.png); margin-right: 15px; }',
        '%availableDomainName%{ position: absolute; top: -5px; left: 70px; font-size: 28px; max-width: 337px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
        '%.availableLabel%{ display: inline-block; position: relative; font-size: 20px; color: #6bb445; }',
        '%availableDomainPrice%{  display: inline-block;position: absolute;font-family: "Helvetica Neue Light", "HelveticaNeueW01-45Ligh", "HelveticaNeueW02-45Ligh", "HelveticaNeueW10-45Ligh", Helvetica, Arial, sans-serif;font-size: 30px;color: #555555;right: 225px;top: 10px;}',
        '%btnBuyAvailableDomain%{ display: inline-block;position: absolute;font-family: "Helvetica Neue Medium", "HelveticaNeueW01-65Medi", "HelveticaNeueW02-65Medi", "HelveticaNeueW10-65Medi", Helvetica, Arial, sans-serif;font-size: 24px;color: white;background:url([tdr]buy-button.png);right: 0px;top:3px;padding: 8px 30px 8px;border-radius: 6px;cursor: pointer;}',
        '%btnBuyAvailableDomain%:hover{ background:url([tdr]buy-button-hover.png); }',
        '%searchAgain% { position: absolute; bottom: -57px; left: -65px; background: url([tdr]search-again-arrow.png) 0 1px no-repeat; padding-left: 17px; cursor: pointer; font-size: 14px; }',


        // Error message
        '%error% { display: none; position: relative; margin-top:35px; height: 50px; background:url([tdr]no-icon.png) 0 0 no-repeat; padding-left: 65px; line-height: 54px; font-size: 20px; color: #555555; }',
        '[state~=error-on] %error% { display: block; }',

        // Alternative domains list -- Don't remove the spaces before .class styling!!
        '%alternativeDomainsContainer% { display: none; position: relative; margin-top: 30px; width: 100%; font-size: 20px; color: #555555; }',
        '[state~=altDomains-show] %alternativeDomainsContainer% { display: block; }',
        '%alternativeDomainsContainer% p { margin-bottom: 5px; }',
        '%alternativeDomains% li { position: relative; left: 0; right: 0; height: 53px; line-height: 53px; }',
        ' .altDomainInfo { display: inline-block; position: absolute; left: 0; right: 130px; border-bottom: [brw] solid #cfcfcf; }',
        '%alternativeDomains% li:last-child %.altDomainInfo% { border: 0; }', // remove border from last li
        ' .altDomainName { float: left; }',
        ' .altDomainPrice { float: right; color: black; }',
        ' .btnBuyAltDomain { position: relative; float: right; top: 5px; color: #545454; display: inline-block; font-size: 16px; background-color: #FFF; border: 1px solid #CFCFCF; [$BorderRadius]; line-height: 42px; padding: 0 20px; cursor: pointer; }',
        ' .btnBuyAltDomain:hover { background-color: #f5f5f5; }'
    ]);
});