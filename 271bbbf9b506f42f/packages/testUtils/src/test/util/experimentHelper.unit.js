define(['experiment', 'testUtils'], function(experiment, testUtils) {
    'use strict';

    var openExperiments = testUtils.experimentHelper.openExperiments;
    var closeExperiments = testUtils.experimentHelper.closeExperiments;
    var setExperimentValue = testUtils.experimentHelper.setExperimentValue;

    describe('openExperiments', function() {
        it('should do nothing if not invoked', function() {
            expect(experiment.isOpen('xxx')).toBe(false);
        });

        it('should open experiment passed as a single argument', function() {
            openExperiments('xxx');
            expect(experiment.isOpen('xxx')).toBe(true);
        });

        it('should open experiments passed as multiple arguments', function() {
            openExperiments('xxx', 'yyy', 'zzz');
            expect(experiment.isOpen('xxx')).toBe(true);
            expect(experiment.isOpen('yyy')).toBe(true);
            expect(experiment.isOpen('zzz')).toBe(true);
        });

        it('should open experiment passed as an array value', function() {
            openExperiments(['xxx']);
            expect(experiment.isOpen('xxx')).toBe(true);
        });

        it('should open experiments passed as array values', function() {
            openExperiments(['xxx', 'yyy', 'zzz']);
            expect(experiment.isOpen('xxx')).toBe(true);
            expect(experiment.isOpen('yyy')).toBe(true);
            expect(experiment.isOpen('zzz')).toBe(true);
        });

        it('should open experiments passed as multiple arrays values', function() {
            openExperiments(['a', 'b'], ['c', 'd']);
            expect(experiment.isOpen('a')).toBe(true);
            expect(experiment.isOpen('b')).toBe(true);
            expect(experiment.isOpen('c')).toBe(true);
            expect(experiment.isOpen('d')).toBe(true);
        });

        it('should not open experiment if part of a string', function() {
            // cause of naive use of `arr.indexOf(exp)`
            openExperiments('AxxxA');
            expect(experiment.isOpen('xxx')).toBe(false);
        });

        it('should not affect future `it`s', function() {
            expect(experiment.isOpen('xxx')).toBe(false);
        });

        describe('with beforeEach', function() {
            beforeEach(function() {
                openExperiments('xxx');
            });
            it('should open experiment', function() {
                expect(experiment.isOpen('xxx')).toBe(true);
            });
        });

        it('should be able to be called multiple times', function() {
            openExperiments(['xxx']);
            openExperiments(['yyy']);
            openExperiments(['zzz']);
            expect(experiment.isOpen('xxx')).toBe(true);
            expect(experiment.isOpen('yyy')).toBe(true);
            expect(experiment.isOpen('zzz')).toBe(true);
        });

        describe('Nested', function() {
            beforeEach(function() {
                openExperiments('xxx');
            });
            describe('...nested I said!', function() {
                beforeEach(function() {
                    openExperiments('yyy');
                });
                it('should be able to handle nested calls of openExperiments', function() {
                    openExperiments(['zzz']);
                    expect(experiment.isOpen('xxx')).toBe(true);
                    expect(experiment.isOpen('yyy')).toBe(true);
                    expect(experiment.isOpen('zzz')).toBe(true);
                });
            });
        });

    });

    describe('closeExperiments', function() {
        it('should do nothing by itself', function() {
            closeExperiments('xxx');
        });
        it('should be able to close experiment', function() {
            openExperiments('xxx', 'yyy', 'zzz', 'nnn', 'mmm', 'kkk');
            closeExperiments('xxx');
            closeExperiments(['yyy']);
            closeExperiments(['zzz', 'nnn'], 'mmm', ['kkk']);
            expect(experiment.isOpen('xxx')).toBe(false);
            expect(experiment.isOpen('yyy')).toBe(false);
            expect(experiment.isOpen('zzz')).toBe(false);
            expect(experiment.isOpen('nnn')).toBe(false);
            expect(experiment.isOpen('mmm')).toBe(false);
            expect(experiment.isOpen('kkk')).toBe(false);
        });
    });

    describe('open and close Experiment', function() {
        beforeEach(function() {
            openExperiments('xxx');
        });
        it('should be open', function() {
            expect(experiment.isOpen('xxx')).toBe(true);
        });
        describe('inner beforeEach for closing', function() {
            beforeEach(function() {
                closeExperiments('xxx');
            });
            it('should be able to reopen closed experiment', function() {
                openExperiments(['xxx']);
                expect(experiment.isOpen('xxx')).toBe(true);
            });
            it('should be able to close open experiment', function() {
                expect(experiment.isOpen('xxx')).toBe(false);
            });
        });
        it('should not be affected by inner scope', function() {
            expect(experiment.isOpen('xxx')).toBe(true);
        });
        it('should not affect open experiments', function() {
            openExperiments('yyy');
            closeExperiments('xxx');
            expect(experiment.isOpen('yyy')).toBe(true);
        });
    });

    describe('setExperimentValue', function() {
        it('should get undefined from experiment.getValue if no value was set', function() {
            expect(experiment.getValue('x')).toBe(undefined);
        });

        it('should get the value that was set for the experiment', function() {
            setExperimentValue('x', 'v1');
            expect(experiment.getValue('x')).toBe('v1');
        });

        it('should be cleaned after an it', function() {
            expect(experiment.getValue('x')).toBe(undefined);
        });

        it('should be able to handle multiple calls with different experiments', function() {
            setExperimentValue('x', 'v1');
            setExperimentValue('y', 'v9');
            expect(experiment.getValue('x')).toBe('v1');
        });

        describe('with beforeEach', function() {
            beforeEach(function() {
                setExperimentValue('x', 'v2');
            });
            it('should be able to override with different value', function() {
                expect(experiment.getValue('x')).toBe('v2');
                setExperimentValue('x', 'v3');
                expect(experiment.getValue('x')).toBe('v3');
            });
            it('should be able to override with undefined', function() {
                setExperimentValue('x', undefined);
                expect(experiment.getValue('x')).toBe(undefined);
            });
        });

        describe('Nested', function() {
            beforeEach(function() {
                setExperimentValue('x', 'v1');
                setExperimentValue('y', 'v2');
            });
            describe('Nested and override', function() {
                beforeEach(function() {
                    setExperimentValue('y', 'v3');
                    setExperimentValue('w', 'v4');
                });
                it('should be able to handle nested and override calls of setExperimentValue', function() {
                    setExperimentValue('z', 'v5');
                    expect(experiment.getValue('x')).toBe('v1');
                    expect(experiment.getValue('y')).toBe('v3');
                    expect(experiment.getValue('w')).toBe('v4');
                    expect(experiment.getValue('z')).toBe('v5');
                });
            });
        });
    });
});
