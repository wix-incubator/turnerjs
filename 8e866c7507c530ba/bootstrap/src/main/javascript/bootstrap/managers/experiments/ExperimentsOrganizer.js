/**
 * @class managers.experiments.ExperimentsOrganizer
 *
 * descriptors:
 * {
 *    'my-experiment': {
 *        createTime: '2013-06-20T13:45:12',
 *        constraints: { // if my-experiment is running...
 *             // other-experiment1 should not be running
 *             'other-experiment1': 'conflicts'
 *             // other-experiment2 must come before my-experiment if it's running
 *             'other-experiment2': 'optional-before',
 *             // other-experiment3 must come after my-experiment if it's running
 *             'other-experiment3': 'optional-after',
 *             // other-experiment4 must be running too, in any order
 *             'other-experiment4': 'required'
 *             // other-experiment5 must be running too, and come before my-experiment
 *             'other-experiment5': 'required-before',
 *             // other-experiment6 must be running too, and come after my-experiment
 *             'other-experiment6': 'required-after',
 *        }
 *        ... // other details
 *    }
 * }
 */
define.bootstrapClass('bootstrap.managers.experiments.ExperimentsOrganizer', function () {
    'use strict';
    var DATETIME_REGEX = /^[0-9]{4}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9](\.[0-9]{1,9})?$/;

    function ExperimentsOrganizer() {}
    var proto = ExperimentsOrganizer.prototype;

    function compare(a, b) {
        return a > b ? 1
            : a < b ? -1
            : 0;
    }

    ExperimentsOrganizer._defaultLogger = function(name, message) {
        var wixLogErrorNumber = wixErrors != null ? wixErrors[name] : null;

        if (wixLogErrorNumber != null && LOG != null && typeof LOG.reportError == "function") {
            LOG.reportError(wixLogErrorNumber, '', '', message);
        }
    };

    var CONSTRAINT_REGEX = /^(conflicts)|(((required)|(optional))(-((before)|(after)))?)$/;

    function validateDescriptorCreateTime(createTime, descriptorId) {
        if (createTime == null) {
            return {
                name: 'EXPERIMENT_INVALID_DEFINITION',
                message: 'Missing createTime in descriptor "' + descriptorId + '"'
            };
        } else if (!DATETIME_REGEX.test(createTime)) {
            return {
                name: 'EXPERIMENT_INVALID_DEFINITION',
                message: 'Invalid createTime "' + createTime + '" in descriptor "' + descriptorId + '". Valid format: "YYYY-MM-DDThh:mm:ss[.fff]", eg, "2013-06-20T13:45:12"'
            };
        }

        return null;
    }

    function normalizeDescriptorConstraints(constraints, descriptorId) {
        var result = {};
        var exception;

        var forIds = _.keys(constraints);
        var i=0, forId, constraint, lowerCaseId;
        while (!exception && i < forIds.length) {
            forId = forIds[i];

            lowerCaseId = forId.toLowerCase();
            if (result.hasOwnProperty(lowerCaseId)) {
                exception = {
                    name: 'EXPERIMENT_INVALID_DEFINITION',
                    message: 'There is more than one constraint with the lower-case name "' + lowerCaseId + '"' + ' in experiment "' + descriptorId + '"'
                };
            }

            constraint = constraints[forId];

            if (!exception && !CONSTRAINT_REGEX.test(constraint)) {
                exception = {
                    name: 'EXPERIMENT_INVALID_DEFINITION',
                    message: 'Invalid constraint "' + constraint + '" for experiment "' + forId + '" in descriptor "' + descriptorId + '": Valid constraints are: ["conflicts", "required", "optional", "required-before", "optional-before", "required-after", "optional-after"]'
                };
            }

            if (!exception) {
                result[lowerCaseId] = constraint;
            }

            ++i;
        }

        return {
            exception: exception,
            result: result
        };
    }

    function normalizeDescriptor(descriptorId, descriptor) {
        var exception;
        var result = {
            id: descriptorId
        };

        exception = validateDescriptorCreateTime(descriptor.createTime, descriptorId);

        if (!exception) {
            result.createTime = descriptor.createTime;
        }

        if (!exception && descriptor.constraints) {
            var constraintsValidationResult = normalizeDescriptorConstraints(descriptor.constraints, descriptorId);
            exception = constraintsValidationResult.exception;
            result.constraints = constraintsValidationResult.result;
        }

        return { result: result, exception: exception };
    }

    function addConstraintsOrder(normalizedDescriptors, runningExperimentsSet) {
        _.forOwn(normalizedDescriptors, function(descriptor) {
            descriptor.constraintsOrder = _.keys(descriptor.constraints || {}).sort(function(a, b) {
                return runningExperimentsSet[a] - runningExperimentsSet[b];
            });
        });
    }

    function getUnknownExperimentException(id) {
        return {
            name: 'EXPERIMENT_UNKNOWN',
            skipLog: true,
            message: 'Could not find a descriptor for experiment "' + id + '"'
        };
    }

    function getNormalizedDescriptors(runningExperimentIds, descriptors, removalLogger) {
        var result = {}, id, exception, descriptor;

        for(var i=0; i<runningExperimentIds.length; i++) {
            id = runningExperimentIds[i];
            exception = null;

            if (id.toLowerCase() != id) {
                exception = {
                    name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_LIST',
                    message: 'Id for experiment "' + id + '" in list of running experiments is not in all-lowercase; this experiment will not be enabled'
                };
            }

            descriptor = descriptors[id];
            if (!exception && !descriptor) {
                exception = getUnknownExperimentException(id);
            }

            if (!exception) {
                var normalizeResult = normalizeDescriptor(id, descriptor);
                exception = normalizeResult.exception;
            }

            if (!exception) {
                result[id] = normalizeResult.result;
            } else {
                removalLogger(id, exception);
            }
        }

        return result;
    }

    ExperimentsOrganizer._normalizeDescriptors = function(runningExperimentIds, descriptors, removalLogger) {
        removalLogger = removalLogger || function() {};

        var nonLowerCaseIds = _.filter(_.keys(descriptors), function(id) { return id != id.toLowerCase(); });
        _.forEach(nonLowerCaseIds, function(id) {
            removalLogger(id, {
                name: 'EXPERIMENT_ID_NOT_IN_LOWER_CASE_IN_DESCRIPTORS',
                message: 'Id for experiment "' + id + '" in descriptors is not in all-lowercase; this experiment will not be enabled'
            });
        });

        var normalizedDescriptors = getNormalizedDescriptors(runningExperimentIds, descriptors, removalLogger);

        var runningExperimentIdsWithInitialOrder = _.keys(descriptors).sort(function(a, b) {
            return compare(descriptors[a].createTime, descriptors[b].createTime);
        });

        var runningExperimentsSet = ExperimentsOrganizer._arrayToSetObj(runningExperimentIdsWithInitialOrder);

        addConstraintsOrder(normalizedDescriptors, runningExperimentsSet);

        return {
            normalizedDescriptors: normalizedDescriptors,
            runningExperimentIdsWithInitialOrder: runningExperimentIdsWithInitialOrder,
            runningExperimentsSet: runningExperimentsSet
        };
    };

    ExperimentsOrganizer._arrayToSetObj = function(ar) {
        return _.reduce(ar, function(result, key, i) {
            result[key] = i+1;
            return result;
        }, {});
    };

    function tryToEnableExperiment(descriptors, runningExperimentsSet, id, decisionHash, visited) {
        if (decisionHash[id] !== undefined) {
            return decisionHash;
        }

        var withDecisionHash = function(decision) {
            decisionHash[id] = decision;
            return decisionHash;
        };

        visited.push(id);

        var getRequireChainMessage = function() {
            return visited.length > 1 ? '. Require chain: ' + JSON.stringify(visited) : '';
        };

        var descriptor = descriptors[id];
        if (!descriptor) {
            var decision = getUnknownExperimentException(id);
            decision.message += getRequireChainMessage();
            return withDecisionHash(decision);
        }

        var constraints = descriptor.constraints;
        if (!constraints) {
            return withDecisionHash(true);
        }

        var possibleDecisionHash = _.clone(decisionHash);
        possibleDecisionHash[id] = true;

        var orderedConstraints = descriptor.constraintsOrder;

        var forId, type;
        for(var i=0;i < orderedConstraints.length; i++) {
            forId = orderedConstraints[i];
            type = constraints[forId];

            if (type.indexOf('required') == 0) {
                if (!runningExperimentsSet[forId]) {
                    return withDecisionHash({
                        name: 'EXPERIMENT_MISSING_DEPENDENCY',
                        message: 'Experiment "' + id + '" requires experiment "' + forId +
                            '" which is not running' + getRequireChainMessage()
                    });
                }

                possibleDecisionHash = tryToEnableExperiment(descriptors, runningExperimentsSet, forId, possibleDecisionHash, visited);
                if (possibleDecisionHash[forId] !== true) {
                    return withDecisionHash(possibleDecisionHash[forId]);
                }
            } else if (type == 'conflicts') {
                if (possibleDecisionHash[forId] === true) {
                    return withDecisionHash({
                        name: 'EXPERIMENT_IN_CONFLICT',
                        message: 'Experiment "' + id + '" is conflicted with running experiment "' + forId + '"' +
                            getRequireChainMessage()
                    });
                } else if (runningExperimentsSet[forId] && possibleDecisionHash[forId] === undefined) {
                    possibleDecisionHash[forId] = {
                        name: 'EXPERIMENT_IN_CONFLICT',
                        message: 'Running experiment "' + id + '" is conflicted with experiment "' + forId + '"' +
                            getRequireChainMessage()
                    };
                }
            }
        }

        return possibleDecisionHash;
    }

    ExperimentsOrganizer._applyBinaryConstraints = function(runningExperimentIds, descriptors, runningExperimentsSet, removalLogger) {
        removalLogger = removalLogger || function() {};

        var decisionHash = {};
        _.forEach(runningExperimentIds, function(id) {
            decisionHash = tryToEnableExperiment(descriptors, runningExperimentsSet, id, decisionHash, []);
        });

        return runningExperimentIds.filter(function(id) {
            var decision = decisionHash[id];
            if (decision !== true) {
                removalLogger(id, decision);
                runningExperimentsSet[id] = null;
            }
            return decision === true;
        });
    };

    proto.getRemovalLog = function() { return this._removalLog; };

    proto.init = function (customLogger) {
        this._logger = customLogger || ExperimentsOrganizer._defaultLogger.bind(this);
        this._removalLog = [];
        this._removalLogger = ExperimentsOrganizer._defaultRemovalLogger.bind(this);
        return this;
    };

    ExperimentsOrganizer._defaultRemovalLogger = function(id, exception) {
        exception.removedId = id;
        this._removalLog.push(exception);
        if (!exception.skipLog) {
            this._logger(exception.name, exception.message);
        }
    };

    ExperimentsOrganizer._toposort = function(outgoing, nodes) {
        var result = [];
        var exception = null;
        var inResult = {};

        for (var nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
            visit(nodes[nodeIndex], []);
            if (exception) {
                return { exception: exception };
            }
        }

        return { result: result };

        function visit(node, predecessors) {
            if(predecessors.indexOf(node) >= 0) {
                exception = {
                    name: 'EXPERIMENT_CYCLIC_DEPENDENCY',
                    message: JSON.stringify(predecessors.concat(node)),
                    cycleInNode: node
                };
                return;
            }

            if (inResult[node]) {
                return;
            }

            inResult[node] = true;

            // outgoing edges
            var outgoingFromNode = outgoing[node] || [];

            var i = outgoingFromNode.length;
            if (i > 0) {
                var preds = predecessors.concat(node);
                do {
                    --i;
                    visit(outgoingFromNode[i], preds);
                } while (i > 0);
            }

            result.push(node);
        }
    };

    ExperimentsOrganizer._applyOrderConstraints = function(runningExperiments, descriptors, runningExperimentsSet) {
        var outgoing = {};

        _.forEach(runningExperiments, function(id) {
            var descriptor = descriptors[id];

            _.forEach(descriptor.constraintsOrder, function(forId) {

                if (!runningExperimentsSet[forId]) {
                    return;
                }

                var constraint = descriptor.constraints[forId];
                switch(constraint) {
                    case 'required-before':
                    case 'optional-before':
                        outgoing[id] = outgoing[id] || [];
                        outgoing[id].push(forId);
                        break;
                    case 'required-after':
                    case 'optional-after':
                        outgoing[forId] = outgoing[forId] || [];
                        outgoing[forId].push(id);
                        break;
                }
            });
        });

        var toposortResultWithException = ExperimentsOrganizer._toposort(outgoing, runningExperiments);

        if (toposortResultWithException.exception) {
            return {
                exception: toposortResultWithException.exception
            };
        }

        return { result: toposortResultWithException.result };
    };

    ExperimentsOrganizer._applyConstraints = function(runningExperiments, experimentDescriptors, runningExperimentsSet, removalLogger) {

        while(runningExperiments.length > 0) {

            runningExperiments = ExperimentsOrganizer._applyBinaryConstraints(
                runningExperiments, experimentDescriptors, runningExperimentsSet, removalLogger);

            var result = ExperimentsOrganizer._applyOrderConstraints(
                runningExperiments,
                experimentDescriptors,
                runningExperimentsSet);

            if (result.exception) {
                var e = result.exception;
                if (e.name == 'EXPERIMENT_CYCLIC_DEPENDENCY') {
                    removalLogger(e.cycleInNode, e);
                    runningExperiments.splice(runningExperiments.indexOf(e.cycleInNode), 1);
                    runningExperimentsSet[e.cycleInNode] = null;
                } else {
                    throw e;
                }
            } else {
                return result.result;
            }
        }

        return [];
    };

    proto.organize = function(runningExperiments, experimentDescriptors) {

        var normalizeDescriptorsResult = ExperimentsOrganizer._normalizeDescriptors(
            runningExperiments,
            experimentDescriptors,
            this._removalLogger);

        var result = ExperimentsOrganizer._applyConstraints(
            normalizeDescriptorsResult.runningExperimentIdsWithInitialOrder,
            normalizeDescriptorsResult.normalizedDescriptors,
            normalizeDescriptorsResult.runningExperimentsSet,
            this._removalLogger);

        return result;
    };

    return ExperimentsOrganizer;
});