/*global bi, PMS, TypeError, ReferenceError*/

/**
 * BI Service
 * @service biService
 */

bi.service('biService', [function(){
    /**
     * @type PMS
     */
    var pms;
    
    /** Holds changes for BI */
    this.changes = {};
    /** Collects changes to the holder. Should be provided during setup */
    this.changesCollector = function(){};

    /**
     * Sends Bi Event to the Editor
     * @param {string} eventName - BI event name
     * @param {*} [param] - BI event parameter
     */
    this.sendBiEvent = function(eventName, param){
        var data = {
            'name': eventName
        };

        if (param) {
            data.params = {
                'c1': param
            };
        }

        if (pms){
            pms.send('bi', data);
        } else {
            throw new ReferenceError("Can't send a postMessage. PMS should be setup before attempt to send a BI event.");
        }
    };

    /**
     * Sets PMS for the service to send BI events to the Editor
     * @param {Object, PMS} arg - PMS settings object or PMS instance itself
     */
    this.setPMS = function(arg){
        if (arg instanceof PMS){
            pms = arg;
        } else if (arg.constructor === Object){
            pms = new PMS({
                connectionID: arg.connectionID,
                targetWindow: arg.targetWindow
            });
        } else {
            throw new TypeError('Incorrect argument type. Should be a settings Object or instance of the PMS.');
        }
    };

    /**
     * Sets up the service
     * @param {Object} sets - settings 
     */
    this.setup = function(sets){
        if (sets.pms){
            this.setPMS(sets.pms);
        }
        
        if (sets.changesCollector){
            this.changesCollector = sets.changesCollector;
        }
    };

    /**
     * Collects changes to the changes holder
     * @param {Object} biData - BI data to collect
     */
    this.collectChanges = function(biData){
        if (!biData.changesCollector){
            this.changesCollector(biData, this.changes);
        } else{
            biData.changesCollector(biData, this.changes);
        }
    };

    /**
     * Sends collected changes to the Editor with the special message and resets the changes holder
     */
    this.sendCollectedChanges = function(){
        pms.send('biChanges', this.changes);
        this.changes = {};
    };
}]);