define(['lodash', 'core/core/siteAspectsRegistry'], function (_, siteAspectsRegistry) {
    'use strict';
    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     *
     */
    function FormManagerAspect(aspectSiteApi) {
        this.siteAPI = aspectSiteApi;
        this._formsPerPage = {};
    }

    FormManagerAspect.prototype = {
        registerCompToForm: function (compId, formName) {

            var pageId = this.siteAPI.getSiteData().getPrimaryPageId();

            var compOnOtherForm = this.getFormOfComp(pageId, compId);
            if (compOnOtherForm) {
                this.unRegisterCompFromForm(compId, compOnOtherForm.formName);
            }

            if (!_.has(this._formsPerPage, pageId)) {
                this._formsPerPage[pageId] = {};
                this._formsPerPage[pageId][formName] = [];
            } else if (!_.has(this._formsPerPage, [pageId, compId])) {
                this._formsPerPage[pageId][formName] = [];
            }
            this._formsPerPage[pageId][formName].push(compId);
        },
        unRegisterCompFromForm: function (compId, formName) {
            var pageId = this.siteAPI.getSiteData().getPrimaryPageId();
            if (!_.has(this._formsPerPage, pageId)) {
                return;
            }
            if (!_.has(this._formsPerPage, [pageId, formName])) {
                return;
            }
            var compsOnForm = this._formsPerPage[pageId][formName];
            if (!_.includes(compsOnForm, compId)) {
                return;
            }
            if (compsOnForm.length === 1) {
                delete this._formsPerPage[pageId][formName];
                return;
            }
            var indexOfComp = compsOnForm.indexOf(compId);
            compsOnForm.splice(indexOfComp, 1);
            this._forms[pageId][formName] = compsOnForm;
        },
        getCompsOnForm: function (formName) {
            var pageId = this.siteAPI.getSiteData().getPrimaryPageId();
            if (!_.has(this._formsPerPage, pageId)) {
                return;
            }
            if (!_.has(this._formsPerPage, [pageId, formName])) {
                return;
            }
            return this._formsPerPage[pageId][formName];
        },
        getFormOfComp: function (pageId, compId) {
            for (var formName in this._formsPerPage[pageId]) {
                if (this._formsPerPage[pageId].hasOwnProperty(formName)) {
                    var compsOnForm = this._formsPerPage[pageId][formName];
                    if (_.includes(compsOnForm, compId)) {
                        return formName;
                    }
                }
            }
            return null;
        },
        isFormExistOnPage: function (formName) {
            var pageId = this.siteAPI.getSiteData().getPrimaryPageId();
            if (!_.has(this._formsPerPage, pageId)) {
                return false;
            }
            if (!_.has(this._formsPerPage, [pageId, formName])) {
                return false;
            }
            return true;
        }


    };

    siteAspectsRegistry.registerSiteAspect('FormManagerAspect', FormManagerAspect);
    return FormManagerAspect;
});
