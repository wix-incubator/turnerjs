describe('ExperimentsOrganizer', function() {
    'use strict';
    //testRequire(1000, true).classes('bootstrap.managers.experiments.ExperimentsOrganizer');

    var logs;
    function testLogger(name, message, extraProperties) {
        var l = {name: name, message: message};
        if (extraProperties) {
            l.extraProperties = extraProperties;
        }

        logs.push(l);
    }

    var removalLog;
    function removalLoggerSpy(id, exception) {
        if (removalLog.hasOwnProperty(id)) {
            throw new Error('Duplicate entry into removal log: "' + id + '": ' + exception);
        }
        removalLog[id] = exception;
    }

    var CLASS_NAME = 'bootstrap.managers.experiments.ExperimentsOrganizer';
    function createInstance() {
        var instance = define.createBootstrapClassInstance(CLASS_NAME, [testLogger]);

        return instance;
    }

    var organizerClass = define.getBootstrapClass(CLASS_NAME);

    beforeEach(function() {
        logs = [];
        removalLog = {};

        var matchException = function(expected, actual) {
            return actual.name == expected.name &&
                (expected.messageRegex == undefined || expected.messageRegex.test(actual.message));
        };

        this.addMatchers({
            toBeEmptyObject: function() {
                return Object.keys(this.actual).length == 0;
            },
            toBeEmptyArray: function() {
                return this.actual.length == 0;
            },
            toDeepEqual: function(expected) {
                return JSON.stringify(this.actual) === JSON.stringify(expected);
            },
            toHaveRemovalLogFor: function(expected) {
                return Object.keys(expected).every(function(id) {
                    var expectedException = expected[id];
                    var logForId = removalLog[id];
                    return logForId != null && matchException(expectedException, logForId);
                });
            },
            toHaveExceptionItem: function(expected) {
                return this.actual.some(function(l) { return matchException(expected, l); });
            },
            toBeException: function(expected) {
                return matchException(expected, this.actual);
            }
        });
    });

    describe('unit tests', function() {
        function addConstraintsOrder(descriptors) {
            descriptors = _.clone(descriptors);
            _.forOwn(descriptors, function(descriptor) {
                var constraints = descriptor.constraints;
                descriptor.constraintsOrder = _.keys(constraints).sort();
            });

            return descriptors;
        }

        describe('_normalizeDescriptors', function() {
            function runNormalizeDescriptors(descriptors, experimentIds) {
                var experimentIds = experimentIds || _.keys(descriptors);
                return organizerClass._normalizeDescriptors(experimentIds, descriptors, removalLoggerSpy).normalizedDescriptors;
            }

            it('should add an id to all descriptors', function() {
                var descriptors = {
                    id1: { createTime: '2000-01-01T00:01:00' },
                    id2: { createTime: '2000-01-01T00:00:00' }
                };

                var result = runNormalizeDescriptors(descriptors);
                Object.forEach(result, function(descriptor, descriptorId) {
                    expect(descriptor.id).toEqual(descriptorId);
                });

                expect(removalLog).toBeEmptyObject();
            });

            it('should filter out descriptors with non lowercase keys', function() {
                var descriptors = {
                    iD1: { createTime: '2000-01-01T00:01:00' },
                    Id2: { createTime: '2000-01-01T00:02:00' },
                    id3: { createTime: '2000-01-01T00:03:00' }
                };

                var result = runNormalizeDescriptors(descriptors, ['id1', 'id2', 'id3']);

                expect(Object.keys(result)).toEqual(['id3']);
                expect(removalLog).toHaveRemovalLogFor({iD1: {name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_DESCRIPTORS' }});
                expect(removalLog).toHaveRemovalLogFor({Id2: {name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_DESCRIPTORS' }});
            });

            it('should filter out ids in list with non lowercase keys', function() {
                var descriptors = {
                    id1: { createTime: '2000-01-01T00:01:00' },
                    id2: { createTime: '2000-01-01T00:02:00' },
                    id3: { createTime: '2000-01-01T00:03:00' }
                };

                var result = runNormalizeDescriptors(descriptors, ['iD1', 'Id2', 'id3']);

                expect(Object.keys(result)).toEqual(['id3']);
                expect(removalLog).toHaveRemovalLogFor({iD1: {name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_LIST' }});
                expect(removalLog).toHaveRemovalLogFor({Id2: {name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_LIST' }});
            });

            it('should log and remove descriptors with invalid constraint', function() {
                var descriptors = {
                    id1: {
                        createTime: '2000-01-01T00:01:00',
                        constraints: {
                            id2: 'whatevah',
                            id3: 'optional'
                        }
                    },
                    id2: { createTime: '2000-01-01T00:03:00' }
                };

                var result = runNormalizeDescriptors(descriptors);

                expect(Object.keys(result).sort()).toEqual(['id2']);
                expect(removalLog).toHaveRemovalLogFor({'id1': { name: 'EXPERIMENT_INVALID_DEFINITION', messageRegex: /Invalid constraint "whatevah"/ }});
            });

            it('should log and remove descriptors with invalid or missing createTime', function() {
                var descriptors = {
                    id1: { createTime: '2000-01-011T00:01:00' },
                    id2: { createTime: '2000-01-01T00:03:00' },
                    id3: {}
                };

                var result = runNormalizeDescriptors(descriptors);

                expect(Object.keys(result).sort()).toEqual(['id2']);
                expect(removalLog).toHaveRemovalLogFor({'id1': { name: 'EXPERIMENT_INVALID_DEFINITION', messageRegex: /Invalid createTime .*"id1"/}});
                expect(removalLog).toHaveRemovalLogFor({'id3': { name: 'EXPERIMENT_INVALID_DEFINITION', messageRegex: /Missing createTime .*"id3"/}});
            });

            it('should log and remove descriptors with duplicate constraint keys in lower case', function() {
                var descriptors = {
                    id1: {
                        createTime: '2000-01-01T00:01:00',
                        constraints: {
                            id2: 'required',
                            Id2: 'optional'
                        }
                    },
                    id2: { createTime: '2000-01-01T00:03:00' }
                };

                var result = runNormalizeDescriptors(descriptors);

                expect(Object.keys(result).sort()).toEqual(['id2']);
                expect(removalLog).toHaveRemovalLogFor({'id1': {name: 'EXPERIMENT_INVALID_DEFINITION', messageRegex: /There is more than one constraint with .*"id1"/}});
            });

            it('should add constraintsOrder to descriptors', function() {
                var descriptors = {
                    id1: {
                        createTime: '2000-01-01T00:01:00',
                        constraints: {
                            id3: 'required',
                            Id2: 'optional'
                        }
                    },
                    id2: { createTime: '2000-01-01T00:02:00' },
                    id3: { createTime: '2000-01-01T00:03:00' }
                };

                var result = runNormalizeDescriptors(descriptors);

                console.log(result);
                console.log(JSON.stringify(removalLog, null, 4))
                expect(result['id1'].constraintsOrder).not.toBeNull();
                expect(result['id1'].constraintsOrder).toEqual(['id2', 'id3']);
            });
        });

        describe('_applyBinaryConstraints', function() {
            function runApplyBinaryConstraints(experimentIds, descriptors) {
                descriptors = addConstraintsOrder(descriptors);
                return organizerClass._applyBinaryConstraints(
                    experimentIds, descriptors, organizerClass._arrayToSetObj(experimentIds), removalLoggerSpy);
            }

            it('should filter out experiments with missing descriptors', function() {
                var result = runApplyBinaryConstraints(['id1', 'id2'], {});
                expect(result).toBeEmptyArray();
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id1: {name: 'EXPERIMENT_UNKNOWN' }});
                expect(removalLog).toHaveRemovalLogFor({id2: {name: 'EXPERIMENT_UNKNOWN' }});
            });

            it('should filter out experiments with missing descriptors (2)', function() {
                var descriptors = {
                    id1: { }
                };

                var result = runApplyBinaryConstraints(['id1', 'id2'], descriptors);
                expect(result).toEqual(['id1']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id2: {name: 'EXPERIMENT_UNKNOWN' }});
            });

            it('should filter out experiments with missing required', function() {
                var descriptors = {
                    id1: { constraints: {id3: 'required'} },
                    id2: { constraints: {id1: 'required'} }
                };

                var result = runApplyBinaryConstraints(['id2', 'id1'], descriptors);
                expect(result).toEqual([]);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id1: {name: 'EXPERIMENT_MISSING_DEPENDENCY', messageRegex: /"id3"/ }});
                expect(removalLog).toHaveRemovalLogFor({id2: {name: 'EXPERIMENT_MISSING_DEPENDENCY', messageRegex: /"id1"/ }});
            });

            it('should filter out experiments which conflict other experiments', function() {
                var descriptors = {
                    id1: { constraints: {id3: 'conflicts'} },
                    id2: {},
                    id3: {}
                };

                var result = runApplyBinaryConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result).toEqual(['id1', 'id2']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id3: {name: 'EXPERIMENT_IN_CONFLICT', messageRegex: /"id1"/ }});
            });

            it('should enable experiments which conflict unknown experiments', function() {
                var descriptors = {
                    id1: { constraints: {idX: 'conflicts'} },
                    id2: { }
                };

                var result = runApplyBinaryConstraints(['id1', 'id2'], descriptors);
                expect(result).toEqual(['id1', 'id2']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toBeEmptyObject();
            });

            it('should process descriptors in order', function() {
                var descriptors = {
                    id3: { constraints: {idX: 'required'} },
                    id2: { constraints: {id1: 'conflicts', id3: 'required' } },
                    id1: { constraints: {} }
                };

                var result = runApplyBinaryConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result).toEqual(['id1']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id2: {name: 'EXPERIMENT_IN_CONFLICT', messageRegex: /"id1"/ }});
                expect(removalLog).toHaveRemovalLogFor({id3: {name: 'EXPERIMENT_MISSING_DEPENDENCY', messageRegex: /"idX"/ }});
            });

            it('should process descriptors in order (2)', function() {
                var descriptors = {
                    id1: { constraints: {id5: 'required'} },
                    id2: { constraints: {id1: 'conflicts', id3: 'required' } },
                    id3: { constraints: {idX: 'required'} },
                    id4: { constraints: {id1: 'conflicts'} },
                    id5: { }
                };

                var result = runApplyBinaryConstraints(['id1', 'id2', 'id3', 'id4', 'id5'], descriptors);
                expect(result).toEqual(['id1', 'id5']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id2: {name: 'EXPERIMENT_IN_CONFLICT', messageRegex: /"id1"/ }});
                expect(removalLog).toHaveRemovalLogFor({id3: {name: 'EXPERIMENT_MISSING_DEPENDENCY', messageRegex: /"idX"/ }});
                expect(removalLog).toHaveRemovalLogFor({id4: {name: 'EXPERIMENT_IN_CONFLICT', messageRegex: /"id1"/ }});
            });

            it('should resolve a require cycle correctly', function() {
                var descriptors = {
                    id1: { constraints: {id2: 'required'} },
                    id2: { constraints: {id3: 'required'} },
                    id3: { constraints: {id1: 'conflicts'} }
                };

                var result = runApplyBinaryConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result).toEqual(['id2', 'id3']);
                //console.log(JSON.stringify(removalLog, null, 4))
                expect(removalLog).toHaveRemovalLogFor({id1: {name: 'EXPERIMENT_IN_CONFLICT', messageRegex: /"id3"/ }});
            });

            it('should not have experiments ids in runningExperimentsSet after they were filtered out', function(){
                var descriptors = {
                    id1: { constraints: {id2: 'required-before'} },
                    id3: { }
                };

                descriptors = addConstraintsOrder(descriptors);
                var experimentIds = ['id1', 'id3'];
                var originalExperimentsSet = organizerClass._arrayToSetObj(experimentIds);
                organizerClass._applyBinaryConstraints(experimentIds, descriptors, originalExperimentsSet);

                expect(originalExperimentsSet['id1']).toBeFalsy();
                expect(originalExperimentsSet['id3']).toBeTruthy();
            });
        });

        describe('_toposort', function() {
            it('should throw for a cyclic dependency', function() {
                var result = organizerClass._toposort(
                    {
                        'id1': ['id2'],
                        'id2': ['id1']
                    },
                    ['id1', 'id2']);
                expect(result.exception).not.toBeNull();
                expect(result.exception.name).toEqual('EXPERIMENT_CYCLIC_DEPENDENCY');
            });
        });

        describe('_applyOrderConstraints', function() {
            function runApplyOrderConstraints(experimentIds, descriptors) {
                descriptors = addConstraintsOrder(descriptors);
                return organizerClass._applyOrderConstraints(
                    experimentIds,
                    descriptors,
                    organizerClass._arrayToSetObj(experimentIds));
            }

            it('should apply order constraints', function() {
                var descriptors = {
                    id1: { constraints: {id2: 'required', id3: 'optional-before'} },
                    id2: { constraints: {id3: 'required-before'}},
                    id3: {}
                };

                var result = runApplyOrderConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result.result).toEqual(['id3', 'id1', 'id2']);
            });

            it('should apply order constraints in the order they were specified in runningExperiments', function() {
                var descriptors = {
                    id1: { constraints: {id3: 'required-before', id2: 'required-before'} },
                    id2: {},
                    id3: {}
                };

                var result = runApplyOrderConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result.result).toEqual(['id3', 'id2', 'id1']);
            });

            it('should throw for a cyclic dependency', function() {
                var descriptors = {
                    id1: { constraints: { id2: 'optional-before' } },
                    id2: { constraints: { id1: 'required-before' } },
                    id3: { }
                };

                var result = runApplyOrderConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result.exception).not.toBeNull();
                expect(result.exception.name).toEqual('EXPERIMENT_CYCLIC_DEPENDENCY');
            });

            it('should only return experiments defined in specified list', function() {
                var descriptors = {
                    id1: { constraints: {id3: 'required-before', id2: 'required-before'} },
                    id2: {},
                    id3: {}
                };

                var result = runApplyOrderConstraints(['id1', 'id2'], descriptors);
                expect(result.result).toEqual(['id2', 'id1']);
            });
        });

        describe('_applyConstraints', function() {
            function runApplyConstraints(experimentIds, descriptors) {
                descriptors = addConstraintsOrder(descriptors);
                return organizerClass._applyConstraints(
                    experimentIds,
                    descriptors,
                    organizerClass._arrayToSetObj(experimentIds),
                    removalLoggerSpy);
            }

            it('should handle a cyclic dependency', function() {
                var descriptors = {
                    id1: { constraints: { id2: 'optional-before' } },
                    id2: { constraints: { id1: 'required-before' } },
                    id3: { }
                };

                var result = runApplyConstraints(['id1', 'id2', 'id3'], descriptors);
                expect(result).toEqual(['id3']);
            });
        });

        it('should sort by createTime', function() {
            var descriptors = {
                id1: { createTime: '2000-01-01T00:01:00' },
                id2: { createTime: '2000-01-01T00:00:00' }
            };

            var result = createInstance().organize(Object.keys(descriptors), descriptors);
            expect(result).toEqual(['id2', 'id1']);
        });
    });

    describe('integration tests', function() {
        var descriptors = {
            id1: { createTime: '2000-01-01T00:00:00' },
            id2: { createTime: '2000-01-01T00:01:00' },
            notEnabled: { createTime: '2000-01-01T00:03:00' }
        };

        it('should not return experiments which are not enabled', function() {
            var result = createInstance().organize(['id1', 'id2'], descriptors);
            expect(result).toEqual(['id1', 'id2']);
        });

        it("should not open experiments that have missing req ", function() {

            var descriptors = {
                id1: { createTime: '2000-01-01T03:11:00', constraints: {id2: 'required'} },
                id3: { createTime: "2013-11-04T12:00:00", constraints: { id1 : "optional-before" }}
            };
            var experimentIds = ['id1', 'id3'];
            var result = createInstance().organize(experimentIds, descriptors);
            expect(result).not.toContain('id1');
        });
    })
});