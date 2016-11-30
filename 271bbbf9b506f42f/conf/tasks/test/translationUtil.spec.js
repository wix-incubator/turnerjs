'use strict'

const translationUtil = require('../lib/translationUtil.js')

describe('translationUtil', () => {

    const requestUtils = require('santa-utils').requestUtils

    describe('getLanguages', () => {
        it('should get languages correctly', done => {
            const mockContents = JSON.stringify(['en'])
            spyOn(requestUtils, 'getRequestPromise').and.callFake(() => Promise.resolve(mockContents))
            translationUtil.getLanguages('GA')
                .then(langs => expect(langs).toEqual(['en']))
                .then(done)
        })
    })

    describe('createFeatureTranslationFile', () => {
        it('should create feature translation file correctly', done => {
            const translations = {
                en: {
                    hello: 'hello'
                },
                he: {
                    hello: 'שלום'
                }
            }
            const getTranslation = url => translations[url.slice(-1 * 'XX.json'.length, -1 * '.json'.length)]
            spyOn(requestUtils, 'getRequestPromise').and.callFake(url => Promise.resolve(JSON.stringify(getTranslation(url))))

            translationUtil.createFeatureTranslationFile('GA', ['en', 'he', 'fr'], 'mockFeature')
                .then(content => expect(content).toEqual(`define(${JSON.stringify(translations, null, 2)});`))
                .then(done)
        })
    })
})
