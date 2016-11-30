define.experiment.Class('wysiwyg.editor.commandregistrars.AccountCommandRegistrar.NewPackagePicker', function(def) {

    def.methods({
        _getBaseUpgradeUrl: function(isTpa, isPremium){
            var premiumServerUrl = window.serviceTopology.premiumServerUrl;
            if(isTpa){
                return premiumServerUrl + '/wix/api/tpaStartPurchase';
            } else if(isPremium){
                return premiumServerUrl + '/wix/api/premiumStart';
            }
            return 'http://www.wix.com/pricing-page/premium5';
        }
    });
});