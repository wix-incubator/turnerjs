define([
    'lodash', 'testUtils', 'utils',
    'documentServices/errors/errors',
    'documentServices/siteMetadata/generalInfo',
    'documentServices/hooks/hooks',
    'documentServices/autosave/autosave',
    'documentServices/saveAPI/saveAPI',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (
    _, testUtils, utils,
    errors,
    generalInfo,
    hooks,
    autosave,
    saveAPI,
    privateServicesHelper
) {
    'use strict';

    var DEFAULT_COUNTERS_CONFIG = {
        AUTOSAVE_TIMEOUT: 10,
        AUTOSAVE_ACTION_COUNT: 3,
        SAVE_AFTER_AUTOSAVE_COUNT: 3,
        DEBOUNCE_WAIT: 2
    };

    function getAutosaveConfig(overrides) {
        return _.assign({},
            {
                enabled: true
            },
            {
                isQA: false,
                forceAutosave: false
            },
            DEFAULT_COUNTERS_CONFIG,
            {
                onDiffSaveStarted: jasmine.createSpy('onDiffSaveStarted'),
                onDiffSaveFinished: jasmine.createSpy('onDiffSaveFinished'),
                onPartialSaveStarted: jasmine.createSpy('onPartialSaveStarted'),
                onPartialSaveFinished: jasmine.createSpy('onPartialSaveFinished')
            },
            overrides
        );
    }

    function setAutosaveConfig(ps, config) {
        autosave.init(ps, config);
    }

    function setSiteNeverSaved(ps, value) {
        var neverSavedPointer = ps.pointers.general.getNeverSaved();
        ps.dal.set(neverSavedPointer, value);
    }

    describe('AutoSave', function () {

        beforeEach(function(){
            spyOn(_, 'debounce').and.callFake(function (func) {
                var debounced = function() {
                    func.apply(this, arguments);
                };
                debounced.cancel = _.noop;
                return debounced;
            });

            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(null, {siteData: [{path: ['documentServicesModel'], optional: true}]});
            this.getAutoSaveInnerPointer = this.ps.pointers.general.getAutoSaveInnerPointer;

            var autosavePointer = this.ps.pointers.general.getAutosaveInfo();
            this.ps.dal.set(autosavePointer, {shouldAutoSave:true});

            setAutosaveConfig(this.ps, getAutosaveConfig());
        });

        afterEach(function () {
            var autosavePointer = this.ps.pointers.general.getAutosaveInfo();
            if (this.ps.dal.isExist(autosavePointer)) {
                autosave.clear(this.ps);
            }
        });

        afterAll(function () {
            hooks.unregisterHooks([hooks.HOOKS.AUTOSAVE.ACTION, hooks.HOOKS.SAVE.SITE_SAVED]);
        });

        describe('Public API', function () {
            describe('init', function () {
                beforeEach(function(){
                    spyOn(utils.log, 'error');
                });

                it('should be defined', function () {
                    expect(autosave.init).toBeDefined();
                });

                it('should return true if autosave is initialized', function () {
                    var validConfig = getAutosaveConfig();

                    expect(autosave.init(this.ps, validConfig)).toEqual(true);
                });

                describe('autosave disabled', function () {
                    it('should return false if config.enabled is false', function () {
                        var disabledConfig = getAutosaveConfig({enabled:false});

                        expect(autosave.init(this.ps, disabledConfig)).toEqual(false);
                        expect(utils.log.error).not.toHaveBeenCalled();
                    });

                    describe('invalid config', function () {
                        it('should return false if missing config object', function () {
                            expect(autosave.init(this.ps, undefined)).toEqual(false);
                            expect(utils.log.error).toHaveBeenCalled();
                        });

                        it('should return false if config object is missing keys', function () {
                            expect(autosave.init(this.ps, {})).toEqual(false);
                            expect(utils.log.error).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('canAutosave', function () {
                it('should be defined', function () {
                    expect(autosave.canAutosave).toBeDefined();
                });

                describe('shouldAutoSave flag from server', function () {
                    beforeEach(function(){
                        this.shouldAutoSavePointer = this.getAutoSaveInnerPointer('shouldAutoSave');
                    });

                    it('if documentServicesModel.autoSaveInfo is not defined (template), canAutosave should be false', function () {
                        var autosavePointer = this.ps.pointers.general.getAutosaveInfo();
                        this.ps.dal.remove(autosavePointer);

                        var canAutoSave = autosave.canAutosave(this.ps);
                        expect(canAutoSave).toBe(false);
                    });

                    it('shouldAutoSave is false', function () {
                        this.ps.dal.set(this.shouldAutoSavePointer, false);

                        var canAutoSave = autosave.canAutosave(this.ps);

                        expect(canAutoSave).toBe(false);
                    });

                    it('shouldAutoSave is true', function () {
                        this.ps.dal.set(this.shouldAutoSavePointer, true);

                        var canAutoSave = autosave.canAutosave(this.ps);

                        expect(canAutoSave).toBe(true);
                    });
                });

                describe('Sites from On Boarding', function () {
                    it('should return false for sites from onBoarding that never been saved in the editor', function () {
                        spyOn(generalInfo, 'isSiteFromOnBoarding').and.returnValue(true);

                        var canAutoSave = autosave.canAutosave(this.ps);

                        expect(canAutoSave).toBe(false);
                    });
                });

                it('should return false for sites that never been saved', function () {
                    setSiteNeverSaved(this.ps, true);

                    var canAutoSave = autosave.canAutosave(this.ps);

                    expect(canAutoSave).toBe(false);
                });

                it('should return true if all conditions are met', function () {
                    setSiteNeverSaved(this.ps, false);
                    spyOn(generalInfo, 'isSiteFromOnBoarding').and.returnValue(false);
                    setAutosaveConfig(this.ps, getAutosaveConfig({isQA: false}));

                    var canAutoSave = autosave.canAutosave(this.ps);

                    expect(canAutoSave).toBe(true);
                });
            });

            describe('autosave', function () {
                it('should be defined', function () {
                    expect(autosave.autosave).toBeDefined();
                });

                it('should trigger autosave if needed', function () {
                    var triggerName = 'test';
                    var callbackSpy = jasmine.createSpy('autosave callback');
                    spyOn(saveAPI, 'autosave').and.callFake(function(ps, onSuccess, onError, trigger){ onSuccess(trigger); });

                    autosave.autosave(this.ps, callbackSpy, callbackSpy, triggerName);

                    expect(saveAPI.autosave.calls.count()).toBe(1);
                    expect(callbackSpy).toHaveBeenCalledWith(triggerName);
                });

                it('should trigger auto full save if needed', function () {
                    var callbackSpy = jasmine.createSpy('autosave callback');
                    testUtils.experimentHelper.openExperiments('sv_autoFullSave');
                    spyOn(saveAPI, 'save').and.callFake(callbackSpy);
                    spyOn(saveAPI, 'autosave');

                    _.times(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT, function() {
                        autosave.autosave(this.ps, callbackSpy, callbackSpy);
                    }, this);

                    expect(saveAPI.autosave.calls.count()).toBe(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT - 1);
                    expect(saveAPI.save.calls.count()).toBe(1);
                });

                it('should NOT trigger auto full save before reaching the count', function () {
                    var callbackSpy = jasmine.createSpy('autosave callback');
                    testUtils.experimentHelper.openExperiments('sv_autoFullSave');
                    spyOn(saveAPI, 'save').and.callFake(callbackSpy);
                    spyOn(saveAPI, 'autosave');

                    _.times(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT - 1, function() {
                        autosave.autosave(this.ps, callbackSpy, callbackSpy);
                    }, this);

                    expect(saveAPI.autosave.calls.count()).toBe(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT - 1);
                    expect(saveAPI.save.calls.count()).toBe(0);
                });

                it('should call onError with appropriate error if cant autosave', function () {
                    var expextedError = {document: 'Autosave not available'};
                    var successCallbackSpy = jasmine.createSpy('autosave success callback');
                    var failCallbackSpy = jasmine.createSpy('autosave fail callback');

                    setSiteNeverSaved(this.ps, true);
                    autosave.autosave(this.ps, successCallbackSpy, failCallbackSpy);

                    expect(successCallbackSpy).not.toHaveBeenCalled();
                    expect(failCallbackSpy).toHaveBeenCalledWith(expextedError);
                });
            });
        });

        describe('AutoSave Logic', function () {
            beforeEach(function(){
                this.simulateActions = function(count) {
                    _.times(count, function() {
                        hooks.executeHook(hooks.HOOKS.AUTOSAVE.ACTION);
                    }, this);
                };

                jasmine.clock().install();
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            describe('Hooks', function () {
                beforeEach(function(){
                    spyOn(hooks, 'registerHook');
                    spyOn(hooks, 'unregisterHooks');
                });

                it('should register hooks to undo/redo actions and site saved', function () {
                    setAutosaveConfig(this.ps, getAutosaveConfig());

                    expect(hooks.registerHook.calls.all()[0].args[0]).toEqual(hooks.HOOKS.AUTOSAVE.ACTION);
                    expect(hooks.registerHook.calls.all()[1].args[0]).toEqual(hooks.HOOKS.SAVE.SITE_SAVED);
                });

                describe('Autosave is disabled in config', function () {
                    it('should NOT register hooks', function () {
                        setAutosaveConfig(this.ps, getAutosaveConfig({enabled: false}));

                        expect(hooks.registerHook).not.toHaveBeenCalled();
                    });

                    it('should unregister existing hooks', function () {
                        setAutosaveConfig(this.ps, getAutosaveConfig({enabled: false}));

                        expect(hooks.unregisterHooks).toHaveBeenCalledWith([hooks.HOOKS.AUTOSAVE.ACTION, hooks.HOOKS.SAVE.SITE_SAVED]);
                    });
                });
            });

            describe('handleUserAction', function () {
                describe('auto-save counters and timers', function () {
                    beforeEach(function(){
                        spyOn(saveAPI, 'save');
                        spyOn(saveAPI, 'autosave');
                    });

                    it('should trigger autosave after X actions', function(){
                        this.simulateActions(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_ACTION_COUNT);

                        expect(saveAPI.autosave.calls.count()).toBe(1);
                    });

                    it('should NOT call autosave after fewer than X actions (from config)', function(){
                        this.simulateActions(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_ACTION_COUNT - 1);

                        expect(saveAPI.autosave.calls.count()).toBe(0);
                    });

                    it('should call autosave after timeout has passed since the last user action', function(){
                        this.simulateActions(1);

                        jasmine.clock().tick((DEFAULT_COUNTERS_CONFIG.AUTOSAVE_TIMEOUT * 1000) + 1);

                        expect(saveAPI.autosave.calls.count()).toBe(1);
                    });

                    it('should not call autosave if a full timeout did not happen since the last user action', function(){
                        this.simulateActions(1);
                        jasmine.clock().tick(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_TIMEOUT * 500);
                        this.simulateActions(1);
                        jasmine.clock().tick((DEFAULT_COUNTERS_CONFIG.AUTOSAVE_TIMEOUT * 500) + 1);

                        expect(saveAPI.autosave.calls.count()).toBe(0);
                    });
                });

                describe('Auto Full Save', function () {
                    beforeEach(function(){
                        spyOn(saveAPI, 'save');
                    });

                    it('should call a full save after Y autosaves (from config)', function() {
                        testUtils.experimentHelper.openExperiments('sv_autoFullSave');
                        spyOn(saveAPI, 'autosave');

                        _.times(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT, function() {
                            this.simulateActions(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_ACTION_COUNT);
                        }, this);

                        expect(saveAPI.autosave.calls.count()).toBe(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT - 1);
                        expect(saveAPI.save.calls.count()).toBe(1);
                    });

                    it('should NOT call a full save after Y autosaves (from config) that failed due to concurrency error', function() {
                        testUtils.experimentHelper.openExperiments('sv_autoFullSave');
                        spyOn(saveAPI, 'autosave').and.callFake(function (ps, onSuccess, onFail) {
                            onFail({document: {errorType: errors.save.CONCURRENT_AUTO_SAVE}});
                        });

                        _.times(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT, function() {
                            this.simulateActions(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_ACTION_COUNT);
                        }, this);

                        expect(saveAPI.autosave.calls.count()).toBe(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT);
                        expect(saveAPI.save.calls.count()).toBe(0);
                    });

                    it('should NOT call a full save after Y autosaves (from config) if the experiment is closed', function(){
                        testUtils.experimentHelper.closeExperiments('sv_autoFullSave');
                        spyOn(saveAPI, 'autosave');

                        _.times(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT, function() {
                            this.simulateActions(DEFAULT_COUNTERS_CONFIG.AUTOSAVE_ACTION_COUNT);
                        }, this);

                        expect(saveAPI.autosave.calls.count()).toBe(DEFAULT_COUNTERS_CONFIG.SAVE_AFTER_AUTOSAVE_COUNT);
                        expect(saveAPI.save.calls.count()).toBe(0);
                    });
                });
            });
        });
    });
});
