/**
 * @Class wysiwyg.editor.components.panels.PayPalButtonPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.PayPalButtonPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel', '_updateDetails', '_loadDetails','_isBuyButton', '_isDonateButton']);

    def.dataTypes(['PayPalButton']);

    /**
     * @lends wysiwyg.editor.components.panels.PayPalButtonPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function() {
            this.setNumberOfItemsPerLine(1);

            var that = this;
            // General
            this._buttonType = this.addComboBox(this._translate("PAYPAL_BUTTON_TYPE")).bindToProperty("buttonType").hideOnMobile();

            this.addInputGroupField(function(){
                that._merchantID = this.addInputField(this._translate("PAYPAL_MERCHANT_EMAIL"),"", 0, 100);

                // Buy
                that._itemName = this.addInputField(this._translate("PAYPAL_ITEM_NAME"), '');
                that._itemID = this.addInputField(this._translate("PAYPAL_ITEM_ID"), '');

                // Donate
                that._organization = this.addInputField(this._translate("PAYPAL_ORG_NAME"), "", 0, 127);
                that._organizationID = this.addInputField(this._translate("PAYPAL_ORG_ID"), "", 0, 127);

                that._amount = this.addInputField(this._translate("PAYPAL_PRICE"),"", 0, 30);

                this.addComboBoxField(this._translate("PAYPAL_CURRENCY"), W.Data.getDataByQuery('#CURRENCY_DATA').getData(), "USD").bindToProperty('currencyCode').hideOnMobile();

                this.addButtonField("", this._translate('GENERAL_UPDATE'), false)
                    .runWhenReady( function( logic ) {
                        logic.addEvent("click", that._updateDetails );
                    });

                // Donate -  Visibility condition
                this.addVisibilityConditions([
                    {   ref: that._organization, predicate: that._isDonateButton},
                    {   ref: that._organizationID, predicate: that._isDonateButton},
                    {   ref: that._itemName, predicate: that._isBuyButton},
                    {   ref: that._itemID, predicate: that._isBuyButton}
                ]);

                that._loadDetails();
            });

            this.addComboBox(this._translate("PAYPAL_OPEN_IN")).bindToProperty('target').hideOnMobile();
            this.addCheckBoxField(this._translate("PAYPAL_USE_SMALL_BUTTON")).bindToProperty('smallButton').hideOnMobile();

            var negative = function (a) { return !a; };
            var showCCLogos = this.addCheckBoxField(this._translate("PAYPAL_HIDE_CREDIT_CARD_LOGOS")).bindToProperty('showCreditCards').bindHooks(negative, negative).hideOnMobile();

            this.addVisibilityCondition(showCCLogos, function() {
                return (!this._previewComponent.getComponentProperty("smallButton"));
            }.bind(this));

            this.addAnimationButton();
        },

        _loadDetails: function() {
            this._merchantID.setValue( this._data.get("merchantID"));
            this._itemName.setValue(this._previewComponent.getComponentProperty("itemName"));
            this._itemID.setValue(  this._previewComponent.getComponentProperty("itemID"));
            this._organization.setValue( this._previewComponent.getComponentProperty("organizationName"));
            this._organizationID.setValue( this._previewComponent.getComponentProperty("organizationID"));
            this._amount.setValue(  this._previewComponent.getComponentProperty("amount"));
        },

        _updateDetails: function() {
            var merchantID = this._merchantID.getValue();
            var price = this._amount.getValue();

            var isEmail = W.Utils.isValidEmail(merchantID);
            var isNumber = W.Utils.isNumber( price );

            if (!isEmail) {
                this._merchantID.showValidationMessage(  this.injects().Resources.getCur('LINK_DLG_BAD_EMAIL') );
            }

            if (!isNumber) {
                this._amount.showValidationMessage(  this.injects().Resources.getCur('NOT_A_NUMBER') );
            } else if (price < 0) {
                this._amount.showValidationMessage(  this.injects().Resources.getCur('NEGATIVE_NUMBER') );
            }

            if (isEmail && isNumber) {
                this._merchantID.resetInvalidState();
                this._amount.resetInvalidState();
                this._data.set("merchantID",  merchantID);
                this._previewComponent.setComponentProperty("amount",  price.replace("+", ""));
                this._previewComponent.setComponentProperty("itemName", this._itemName.getValue());
                this._previewComponent.setComponentProperty("itemID", this._itemID.getValue());
                this._previewComponent.setComponentProperty("organizationName", this._organization.getValue());
                this._previewComponent.setComponentProperty("organizationID", this._organizationID.getValue());
            }
        },

        _isBuyButton: function() {
            return (this._previewComponent.getComponentProperty("buttonType") == "buy");
        },

        _isDonateButton: function() {
            return (this._previewComponent.getComponentProperty("buttonType") == "donate");
        }
    });
});