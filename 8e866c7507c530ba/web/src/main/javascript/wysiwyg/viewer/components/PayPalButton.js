/**
 * @class wysiwyg.viewer.components.PayPalButton
 */
define.component('wysiwyg.viewer.components.PayPalButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands', 'W.Config']);

    def.dataTypes(['PayPalButton']);

    def.propertiesSchemaType("PayPalButtonProperties");

    def.skinParts( {
        buttonContainer: {type: 'htmlElement'}
    });

    def.statics({
        EDITOR_META_DATA:{
            general:{
                settings    : true,
                design      : false
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._resizableSides = [];
        },

        render: function() {
            this._createPayPalForm();
        },

        _createPayPalForm: function() {
            this._buttonType         = this.getComponentProperty("buttonType");
            var amount      =   this.getComponentProperty("amount");
            var isDynamicAmount      =   (!amount || Number(amount) == 0);
            var target               =   this.getComponentProperty("target");
            var cmdType              = (  this._buttonType == "buy" ? "_xclick" : "_donations");

            this._form = new Element("form", {
                action: "https://www.paypal.com/cgi-bin/webscr",
                method: "POST"
            });

            this._skinParts.buttonContainer.empty();
            this._skinParts.buttonContainer.adopt(this._form);

            this._form.set("target", target);

            this._addHiddenInput("cmd", cmdType);
            this._addHiddenInput("business",  this._data.get("merchantID"));
            this._addHiddenInput("item_name", (this._buttonType == "buy" ? this.getComponentProperty("itemName") : this.getComponentProperty("organizationName")));
            this._addHiddenInput("item_number", (this._buttonType == "buy" ? this.getComponentProperty("itemID") : this.getComponentProperty("organizationID")));

            this._addHiddenInput("notify_url", 'https://inventory.wix.com/ecommerce/ipn/paypal'); //TODO: change this when it will be changed

            if ( target == '_blank') {
                var href = document.location.href;
                this._addHiddenInput("return", href);
                this._addHiddenInput("cancel_return", href);
            }

            if (!isDynamicAmount) {
                this._addHiddenInput("amount", this.getComponentProperty("amount") );
            }

            this._addHiddenInput("currency_code",  this.getComponentProperty("currencyCode"));
//            this._addHiddenInput("custom",'{"siteId":' + this.resources.W.Config.getSiteId()+ '}' );

            if (this._buttonType == "buy") {
                this._addHiddenInput("bn", "Wix_BuyNow_WPS_IL");
            } else {
                this._addHiddenInput("bn", "Wix_Donate_WPS_IL");
            }

            this._addSubmitImage();

            this._addPixelImage();

            this._alignSize();

            this._form.addEvent("click", function(e) {
                if (target === "_self") {
                    if(this.resources.W.Config.env.$isEditorViewerFrame) {
                        // Prevent paypal form from being submitted
                        e.preventDefault();
                    }
                    var params = { component: this };
                    this.resources.W.Commands.executeCommand('linkableComponent.navigateSameWindow', params, this);
                }
            }.bind(this));
        },

        _alignSize: function() {
            var showCreditCards = this.getComponentProperty("showCreditCards");
            var smallButton = this.getComponentProperty("smallButton");
            var height, width;

            if (smallButton) {
                height = 21;
                width = (this._buttonType == "buy" ? 86 : 74);
            } else { // big button
                if (showCreditCards) {
                    height = 47;
                    width = 170;
                }
                else {
                    height = 26;
                    width = (this._buttonType == "buy" ? 107 : 92);
                }
            }

            this.setWidth( width );
            this.setHeight( height );
            this._view.setStyle("height", height + "px");

        },

        _addSubmitImage: function () {
            var input = new Element("input", {
                'type': "image",
                'name': "submit",
                "border": 0,
                'src': (
                    function () {
                        var showCreditCards = this.getComponentProperty("showCreditCards");
                        var smallButton = this.getComponentProperty("smallButton");
                        var language = "en_US";
                        var baseURL = "https://www.paypalobjects.com/"+ language + "/i/btn/btn_";
                        baseURL += ( this._buttonType == "buy" ? "buynow" : "donate");
                        baseURL += ( showCreditCards && !smallButton ? "CC" : ""); // Credit cards can be shown only on big size
                        baseURL += ( smallButton? "_SM" : "_LG");
                        baseURL +=".gif";

                        return baseURL;
                    }.bind(this)
                    )()
            });

            this._form.adopt( input );
        },

        _addHiddenInput: function(name, value) {
            var input = new Element("input", {
                'type': "hidden",
                'name': name,
                'value': value
            });

            this._form.adopt( input );
        },

        _addPixelImage: function() {
            this._form.adopt( new Element("img", {
                src: "https://www.paypalobjects.com/en_US/i/scr/pixel.gif",
                width: "1",
                height: "1"
            }));
        }

    });
});
