/**
 * @Class wysiwyg.editor.components.panels.EbayItemsBySellerPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.EbayItemsBySellerPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', '_isEbayUser', '_onEbayUserCheckDone']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['EbayItemsBySeller']);

    def.fields({
        _lastSelectedBg: 0
    });

    /**
     * @lends wysiwyg.editor.components.panels.EbayItemsBySellerPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            var panel = this;
            var bg = 'radiobuttons/ebay/ebay_thumb_btns.png';
            var bgDimensions = {w: '78px', h: '48px'};
            var imageOptions  = [
                {value:"0"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_none.png'},    //None
                {value:"2"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_blue.png'},   //'Purple',
                {value:"3"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_blue3.png'},    //'Blue Leafs',
                {value:"4"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_blue2.png'},   //'Blue Stars',
                {value:"5"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_pink.png'},    //'Pink Bubbles',
                {value:"6"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_orange.png'},  //'Orange Shirt Buttons',
                {value:"7"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_red.png'},     //'Burgundy Snowflakes',
                {value:"8"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_green1.png'},  //'Green Wheels',
                {value:"9"  , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_green2.png'},  //'Green Polygons',
                {value:"10" , image: bg, dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_gray.png'},    //'Gray Play/Pause',
                {value:"11" , image: bg,dimensions: bgDimensions, icon: 'radiobuttons/ebay/ebay_brown.png'}    //'Brown Notes',
            ];

            var that = this;

            this.addInputGroupField(function(){
                that._sellerIdInput = this.addSubmitInputField(
                    this._translate('EbayItemsBySellerPanel.sellerId'),
                    this._translate('EbayItemsBySellerPanel.sellerId.placeholder'), null, null,
                    this._translate('EbayItemsBySellerPanel.sellerId.button'), null).addEvent('inputChanged', that._isEbayUser);

                if (that._data.get('sellerId')) {
                    that._sellerIdInput.setValue(that._data.get('sellerId'));
                }

                that._checkingUserLabel = this.addSubLabel(that._translate('EbayItemsBySellerPanel.checkingUser'));
                that._checkingUserLabel.collapse();
                that._userDoesNotExistLabel = this.addSubLabel(that._translate('EbayItemsBySellerPanel.Errors.userDoesNotExist'), '#600');
                that._userDoesNotExistLabel.collapse();
            });

            this.addInputGroupField(function(){
                this.addRadioImagesField(
                    this._translate('EbayItemsBySellerPanel.headerImage'),
                    imageOptions, null, null, 'inline').bindToProperty('headerImage');
            });


            this.addStyleSelector();
            this.addAnimationButton();
        },

        _isEbayUser: function(evt) {
            var id = evt.value;
            var apiCallUrl =
                'http://open.api.ebay.com/shopping?callname=GetUserProfile&responseencoding=JSON&version=757&callback=true&appid=Wixpress-100d-4e1c-905b-3bc0f3b60757&UserID=';
            apiCallUrl = apiCallUrl + encodeURIComponent(id);

            this._checkingUserLabel.uncollapse();
            this._userDoesNotExistLabel.collapse();

            window._cb_GetUserProfile = function(response) { this._onEbayUserCheckDone(id, response); }.bind(this);
            var script = new Element('script', { 'type': 'text/javascript', 'src': apiCallUrl });
            document.head.grab(script, 'bottom');
        },

        _onEbayUserCheckDone: function(id, response) {
            // SUCCESS CASE
            // _cb_GetUserProfile({"Timestamp":"2012-02-23T15:16:35.731Z","Ack":"Success","Build":"E761_CORE_BUNDLED_14436561_R1","Version":"761","User":{"UserID":"helfel","FeedbackPrivate":false,"FeedbackRatingStar":"Purple","FeedbackScore":544,"NewUser":false,"RegistrationDate":"2001-11-26T23:14:25.000Z","RegistrationSite":"US","Status":"Confirmed","SellerBusinessType":"Undefined","SellerItemsURL":"http://search.ebay.com/?sass=helfel&amp;ht=-1","FeedbackDetailsURL":"http://feedback.ebay.com/ws/eBayISAPI.dll?ViewFeedback&userid=helfel&ssPageName=STRK:ME:UFS","PositiveFeedbackPercent":99.3}});         *
            // ERROR CASE
            // _cb_GetUserProfile({"Timestamp":"2012-02-23T15:15:06.294Z","Ack":"Failure","Errors":[{"ShortMessage":"Input data is invalid.","LongMessage":"Input data for tag UserID has invalid value(s) matanxxx","ErrorCode":"10.47","SeverityCode":"Error","ErrorParameters":[{"Value":"UserID","ParamID":"0"},{"Value":"matanxxx","ParamID":"1"}],"ErrorClassification":"RequestError"}],"Build":"E761_CORE_BUNDLED_14436561_R1","Version":"761"});

            this._checkingUserLabel.collapse();

            if (response.Ack == 'Success') {
                this._data.set('registrationSite', response.User.RegistrationSite, true);
                this._data.set('sellerId', id);
            }
            else {
                this._userDoesNotExistLabel.uncollapse();
            }
        }
    });
});