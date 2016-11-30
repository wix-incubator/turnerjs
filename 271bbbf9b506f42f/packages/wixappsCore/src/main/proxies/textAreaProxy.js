define(["siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/inputProxy"],
    function (siteUtils, /** wixappsCore.typesConverter */typesConverter, inputProxy) {
        'use strict';

        /**
         * @class proxies.TextArea
         * @extends proxies.mixins.inputProxy
         */
        return {
            mixins: [inputProxy],
            renderProxy: function () {
                var componentType = "wixapps.integration.components.inputs.TextArea";
                var props = this.getChildCompProps(componentType);
                var data = this.proxyData;
                var isValid = data.valid !== undefined ? data.valid : true;
                props.compData = typesConverter.text(this.state.text, this.getCompProp('maxLength'));

                props.compProp = {
                    placeholder: this.getCompProp('placeholder'),
                    label: this.getCompProp('label'),
                    message: this.getCompProp('message') || !isValid,
                    isPreset: this.getCompProp('isPreset'),
                    onChange: this.updateText,
                    onBlur: this.onBlur
                };

                return siteUtils.compFactory.getCompClass(componentType)(props);
            },

            getInitialState: function(){
                var data = this.proxyData;
                var text = data.text !== undefined ? data.text : data;

                return {
                    text: text
                };
            },

            updateText: function(event){
                var text = event.target.value;
                this.setState({
                    text: text
                });
            },

            onBlur: function(event, domID){
                var text = event.target.value;
                event.type = 'inputChanged';
                //escaping..?
                event.payload = {
                    value: text
                };
                var path = this.proxyData.text !== undefined ? 'text' : 'this';
                this.setData(text, path);
                this.handleViewEvent(event, domID);
            }
        };
    });
