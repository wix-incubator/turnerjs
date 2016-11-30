define(['utils', 'lodash'], function (utils, _) {
    'use strict';

    var appUrl, collectionId, baseUrl, metaSiteId;
    var types = {
        POST: 'POST',
        GET: 'GET'
    };
    var path = {
        login: "/api/member/login",
        register: "/api/member/register",
        apply: "/api/member/apply",
        sendForgotPasswordMail: "/api/member/sendForgotPasswordMail",
        resetMemberPassword: "/api/member/changePasswordWithMailToken",
        getMemberDetails: "/api/member",
        handleOauthToken: "/api/social/token/handle"
    };

    var SiteMembersAPI = { };

    SiteMembersAPI.initializeData = function (siteData) {
        metaSiteId = siteData.getMetaSiteId();
        var collection = siteData.getClientSpecMapEntriesByType("sitemembers")[0];
        collectionId = collection && collection.smcollectionId;
        baseUrl = siteData.serviceTopology.siteMembersUrl;
        appUrl = siteData.currentUrl.full;
    };

    function sendSiteMemberTokenRequest(onSuccess, onError, svSession, token, type){
        var ajaxLibrary = utils.ajaxLibrary;

        var query = '?' + utils.urlUtils.toQueryString({
              collectionId: collectionId,
              metaSiteId: metaSiteId
          });

        var url = baseUrl + path.handleOauthToken + query;
        var data = {
            svSession: svSession,
            token: token,
            provider: type
        };

        var responseHandler = handleResponse(onSuccess, onError);

        ajaxLibrary.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            jsonp: false,
            success: responseHandler,
            error: onError
        });
    }

    function handleResponse(onSuccess, onError) {
        return function(successHandler, errorHandler, data) {
            if (data && !data.errorCode){
                successHandler(data);
            } else {
                errorHandler(data.errorCode);
            }
        }.bind(this, onSuccess, onError);
    }

    function sendSiteMembersRequest(reqPath, data, type, onSuccess, onError, svSession, initiator) {
        var ajaxLibrary = utils.ajaxLibrary;
        var url = baseUrl + reqPath;
        data = _.merge(data || {}, {collectionId: collectionId, metaSiteId: metaSiteId});
        var options = {
            url: url,
            type: type,
            data: data,
            context: this
        };

        if (svSession) {//optional parameters
            _.merge(options.data, {svSession: svSession, appUrl: appUrl});
            if (initiator) { //login with initiator is only done when svsession is available
                options.data.initiator = initiator;
            }
        }

        _.assign(options.data, {accept: 'json'});
        _.assign(options, {
            success: function onComplete(response){
                if (response && !response.errorCode){
                    onSuccess(response);
                } else {
                    onError(response.errorCode);
                }
            },
            error: onError
        });
        ajaxLibrary.get(options);
    }

    SiteMembersAPI.login = function (loginData, onSuccess, onError, svSession, initiator) {
        sendSiteMembersRequest.call(this, path.login, loginData, types.POST, onSuccess, onError, svSession, initiator);
    };

    SiteMembersAPI.register = function (registerData, onSuccess, onError, svSession, initiator) {
        sendSiteMembersRequest.call(this, path.register, registerData, types.POST, onSuccess, onError, svSession, initiator);
    };

    SiteMembersAPI.apply = function (registerData, onSuccess, onError, svSession, initiator) {
        sendSiteMembersRequest.call(this, path.apply, registerData, types.POST, onSuccess, onError, svSession, initiator);
    };

    SiteMembersAPI.sendForgotPasswordMail = function (email, homePageUrl, onSuccess, onError) {
        sendSiteMembersRequest.call(this, path.sendForgotPasswordMail, {email: email, returnUrl:homePageUrl}, types.POST, onSuccess, onError);
    };

    SiteMembersAPI.resetMemberPassword = function (forgotPasswordData, onSuccess, onError) {
        sendSiteMembersRequest.call(this, path.resetMemberPassword, forgotPasswordData, types.POST, onSuccess, onError);
    };

    SiteMembersAPI.getMemberDetails = function (smToken, onSuccess, onError) {
        sendSiteMembersRequest.call(this, path.getMemberDetails + "/" + smToken, null, types.GET, onSuccess, onError);
    };

    SiteMembersAPI.handleOauthToken = function (onSuccess, onError, svSession, token, type) {
        sendSiteMemberTokenRequest.call(this, onSuccess, onError, svSession, token, type);
    };

    return SiteMembersAPI;
});
