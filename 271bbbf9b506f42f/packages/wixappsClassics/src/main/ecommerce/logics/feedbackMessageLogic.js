define(["lodash", "wixappsCore", "wixappsClassics/ecommerce/util/ecomLogger"], function(_, wixapps, ecomLogger){
    "use strict";

    function getOptionsDescription(productOptions){
        var selectedOptionsList = [];
        _.forEach(productOptions, function(option){
            if (option.isSelectableList && option.items && option.items.length){
                var selectedOption = _.find(option.items, {'value': option.selectedValue});
                selectedOptionsList.push(selectedOption.description || selectedOption.text);
            } else if (option.text){
                selectedOptionsList.push(option.text);
            }
        });
        return selectedOptionsList;
    }

    function getVarsFromCustomizations(userCustomizations){
        var vars = {
            msgOrientation: "vertical",
            msgImageMode: "fill",
            betweenButtonsSpacer: 10,
            gotoCheckoutBtnLbl: '',
            continueShoppingBtnLbl: ''
        };

        var feedbackViewCustomizations = _.filter(userCustomizations, {view: 'FeedbackMessage', fieldId: 'vars'});
        vars = _.transform(feedbackViewCustomizations, function(result, customizatoin){
            result[customizatoin.key] = customizatoin.value;
        }, vars);
        return vars;
    }

    function FeedbackMessageLogic(partApi){
        this.partApi = partApi;
    }

    FeedbackMessageLogic.prototype = {
        getViewVars: function () {
            var pathToProduct = this.partApi.getRootDataItemRef();
            var productBundle = this.partApi.getDataAspect().getDataByPath(this.partApi.getPackageName(), pathToProduct);

            //we apply the user customizations here, because we changed the type of the FeedbackMessage view
            var vars = getVarsFromCustomizations(this.partApi.getPartData().appLogicCustomizations);

            vars.optionDescriptions = getOptionsDescription(productBundle.options).join(', ');

            return vars;
        },

        "continue-shopping": function(){
            var logicParams = this.partApi.getPartData().appLogicParams;
            ecomLogger.reportEvent(this.partApi.getSiteData(), ecomLogger.events.FEEDBACK_MSG_CONTINUE_SHOPPING_BTN_CLICKED, {
                itemValue: logicParams.itemId.value
            });
            this.closeFeedbackMessage();
        },

        "goto-checkout": function () {
            var logicParams = this.partApi.getPartData().appLogicParams;
            var cartPageId = _.get(logicParams, 'cartPageID.value');
            var cartPageData = cartPageId && this.partApi.getSiteData().getDataByQuery(cartPageId);
            this.closeFeedbackMessage();
            if (cartPageData){
                ecomLogger.reportEvent(this.partApi.getSiteData(), ecomLogger.events.FEEDBACK_MSG_CHECKOUT_BTN_CLICKED, {
                    itemValue: logicParams.itemId.value
                });

                this.partApi.getSiteApi().navigateToPage({pageId: cartPageId});
            }
        },

        closeFeedbackMessage: function(){
            this.partApi.getSiteApi().getSiteAspect('addComponent').deleteComponent('ecomFeedback');
        }
    };
    wixapps.logicFactory.register("03946768-374D-4426-B885-A1A5C6F570B9", FeedbackMessageLogic);
});
