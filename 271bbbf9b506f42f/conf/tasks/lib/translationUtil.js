'use strict'

const _ = require('lodash')
const requestUtils = require('santa-utils').requestUtils

function getJsonFromLangsGa(relPath, langsGa) {
    return requestUtils.getRequestPromise(`http://static.parastorage.com/services/santa-langs/${langsGa}/${relPath}`)
        .then(res => JSON.parse(res))
}

const getFeatureRelPathInLangs = (featureName, lang) => `resources/santa-viewer/bundles/${featureName}/${featureName}_${lang}.json`



function createFeatureTranslationFile(langsGa, languages, featureName) {
    function getTranslationContentPair(lang) {
        const relPath = getFeatureRelPathInLangs(featureName, lang)
        return getJsonFromLangsGa(relPath, langsGa)
            .then(content => [lang, content], () => null)
    }

    return Promise.all(languages.map(getTranslationContentPair))
        .then(langsPairs => _(langsPairs).compact().zipObject().value())
        .then(obj => `define(${JSON.stringify(obj, null, 2)});`)
}

module.exports = {
    getLanguages: ga => getJsonFromLangsGa('languages.json', ga),
    createFeatureTranslationFile
}
