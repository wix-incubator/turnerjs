/**
 * Created by avim on 16/11/2016.
 */
'use strict';
const httpUtils = require('./httpUtils');
const _ = require('lodash');

function Context() {

    let sessionContext = null;
    let sessionRunningExperiments = null;
    let sessionLastRawRunningExperiments = null;
    let sessionlessExperiments = 0;
    const defaultExperiments = {};

    function updateExperimentsIfNeeded() {
        var rawExperiments = _.get(sessionContext, 'model.rendererModel.runningExperiments', defaultExperiments);
        if (rawExperiments !== sessionLastRawRunningExperiments) {
            sessionLastRawRunningExperiments = rawExperiments;
            sessionRunningExperiments = _.mapKeys(sessionLastRawRunningExperiments, function (value, key) {
                return key.toLowerCase();
            });
        }
    }

    function updateContext(context) {
        if (!context) {
            return sessionContext;
        }
        sessionContext = context;
        updateExperimentsIfNeeded();
    }

    function initializeContext(model, ajaxHandler) {
        const context = {
            model: model,
            ajaxHandler: ajaxHandler || httpUtils.ajaxDefaultHandler
        };
        updateContext(context);
    }

    function experimentIsOpen(name) {
        return experimentGetValue(name) === 'new';
    }

    function experimentGetValue(name) {
        if (!sessionContext) {
            sessionlessExperiments++;
            return 'old';
        }
        updateExperimentsIfNeeded();
        return sessionRunningExperiments[name.toLowerCase()];
    }

    function experimentIsMultiValueExperimentOpen(name) {
        let value = experimentGetValue(name);
        return value && value !== 'old';
    }

    function getSessionlessExperiments() {
        return sessionlessExperiments;
    }

    const experiment = {isOpen: experimentIsOpen, getValue: experimentGetValue, isMultiValueExperimentOpen: experimentIsMultiValueExperimentOpen};
    return {
        experiment,
        initializeContext,
        updateContext,
        getSessionlessExperiments
    };
}

module.exports = Context;

