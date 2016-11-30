define(['lodash',
    'utils',
    'tpa',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/tpa/services/clientSpecMapService'], function(_, utils, tpa, siteMetadata, clientSpecMapService) {

   'use strict';

    var premiumAppsUrl = _.template('<%= premiumStateAPIUrl %>?siteGuid=<%= metasiteId %>');
    var YEARLY = 6;

    var getPremiumStateTopology = function(ps) {
        var serviceTopology = ps.pointers.general.getServiceTopology();
        var premiumStatePointer = ps.pointers.getInnerPointer(serviceTopology, 'premiumStateApiUrl');
        return ps.dal.get(premiumStatePointer); // 'http://editor.wix.com/_api/wix/getTpaPremiumState'
    };

    var getPremiumApps = function(ps, metasiteId, onSuccess, onError) {
        var base = getPremiumStateTopology(ps);
        var url = premiumAppsUrl({
            premiumStateAPIUrl: base,
            metasiteId: metasiteId
        });
        utils.ajaxLibrary.ajax({
            type: 'POST',
            url: url,
            data: {},
            dataType: 'json',
            success: function(data) {
                if (_.isFunction(onSuccess)) {
                    onSuccess(data.payload);
                }
            },
            error: onError
        });
    };

    var isYearly = function(packageData) {
        return packageData.cycle === YEARLY;
    };

    var extractYearlyPremiumApps = function(json) {
        var yearlyAppDefIds = [];
        var packageData = json.tpaPackages;
        if (_.isArray(packageData)) {
            _.forEach(packageData, function(packag) {
                if (isYearly(packag)){
                    yearlyAppDefIds.push(packag.appDefinitionId);
                }
            });
        } else if (_.isObject(packageData)) {
            if (isYearly(packageData)){
                yearlyAppDefIds.push(packageData.appDefinitionId);
            }
        }
        return yearlyAppDefIds;
    };

    var getSiteUpgradeUrl = function (ps, queryParameters) {
        var serviceTopology = ps.dal.get(ps.pointers.general.getServiceTopology());
        var baseUpgradeUrl = serviceTopology.premiumServerUrl + '/wix/api/premiumStart';
        var metaSiteId = siteMetadata.generalInfo.getMetaSiteId(ps);
        queryParameters = queryParameters || {};
        queryParameters.siteGuid = metaSiteId;

        return new tpa.common.TPABaseUrlBuilder(baseUpgradeUrl).addMultipleQueryParams(queryParameters).build();
    };

    var getAppUpgradeUrl = function(ps, applicationId, vendorProductId, paymentCycle, options) {
        var serviceTopology = ps.dal.get(ps.pointers.general.getServiceTopology());
        var baseUpgradeUrl = serviceTopology.premiumServerUrl + '/wix/api/tpaStartPurchase';
        var appData = clientSpecMapService.getAppData(ps, applicationId);
        var metaSiteId = siteMetadata.generalInfo.getMetaSiteId(ps);
        options = options || {};

        return new tpa.common.TPABaseUrlBuilder(baseUpgradeUrl)
            .addMultipleQueryParams({
                applicationId: applicationId,
                vendorProductId: vendorProductId,
                paymentCycle: paymentCycle || 'MONTHLY',
                appDefinitionId: appData.appDefinitionId,
                metaSiteId: metaSiteId,
                pp_type: options.pp_type,
                referralAdditionalInfo: options.referralAdditionalInfo
            })
            .build();
    };

    return {
        getPremiumApps: getPremiumApps,
        extractYearlyPremiumApps: extractYearlyPremiumApps,
        isYearly: isYearly,
        getSiteUpgradeUrl: getSiteUpgradeUrl,
        getAppUpgradeUrl: getAppUpgradeUrl
    };
});
