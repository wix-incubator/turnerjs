define(['lodash', 'utils', 'experiment'], function (_, utils, experiment) {
   'use strict';
   var AppMarketUrlBuilder = function (baseUrl) {
      this.url = utils.urlUtils.parseUrl(baseUrl);
      this.url.query = {};
   };

   AppMarketUrlBuilder.prototype = {
      addLangParam: function (lang) {
         if (lang && !_.isEmpty(lang)) {
            this.url.query.lang = lang;
         }

         return this;
      },

      addOriginParam: function (origin) {
         if (origin && !_.isEmpty(origin)) {
            this.url.query.eo = window.btoa(origin);
         }

         return this;
      },

      addDevAppParam: function (appId) {
         if (appId && !_.isEmpty(appId)) {
            this.url.query.appDefinitionId = appId;
         }

         return this;
      },

      addCompIdParam: function () {
         this.url.query.compId = 'MarketPanel';

         return this;
      },

      addAppMarketTests: function (tests) {
         if (tests && !_.isEmpty(tests)) {
            this.url.query.experiment = tests;
         }

         return this;
      },

      addMetaSiteIdParam: function (metaSiteId, newUrl) {

          if (metaSiteId && !_.isEmpty(metaSiteId)){
              if (experiment.isOpen('reactAppMarket') && newUrl) {
                  this.url.query.metaSiteId = metaSiteId;
              } else {
                  this.url.path += '/' + metaSiteId;
              }
          }

         return this;
      },

      addSiteIdParam: function (siteId) {
         if (siteId && !_.isEmpty(siteId)) {
            this.url.query.siteId = siteId;
         }

         return this;
      },

      addTagsParam: function (tag) {
         if (tag && !_.isEmpty(tag)) {
            this.url.query.query = tag;
         }

         return this;
      },

      addOpenAppParam: function (appDefIdTag) {
         if (appDefIdTag && !_.isEmpty(appDefIdTag)) {
            this.url.query.openAppDefId = appDefIdTag;
         }

         return this;
      },

      addNewWixStores: function (isTrue) {
         if (!_.isUndefined(isTrue)) {
            this.url.query.newWixStores = isTrue + '';
         }

         return this;
      },

      addCategoryParam: function (category) {
         if (category && !_.isEmpty(category)) {
            this.url.query.categorySlug = category;
         }

         return this;
      },

      addBiReferralInfoParam: function (referralInfo){
         if (referralInfo && !_.isEmpty(referralInfo)) {
            this.url.query.referralInfo = referralInfo;
         }

         return this;
      },

      addBiReferralInfoCategoryParam: function (referralInfoCategory){
         if (referralInfoCategory && !_.isEmpty(referralInfoCategory)) {
            this.url.query.referralInfoCategory = referralInfoCategory;
         }

         return this;
      },

      addBiSectionParam: function (section){
         if (section && !_.isEmpty(section)) {
            this.url.query.section = section;
         }

         return this;
      },

      addAddingMethodParam: function (addingMethod){
         if (addingMethod && !_.isEmpty(addingMethod)) {
            this.url.query.addingMethod = addingMethod;
         }

         return this;
      },

      build: function () {
         return utils.urlUtils.buildFullUrl(this.url);
      }
   };

   return AppMarketUrlBuilder;
});
