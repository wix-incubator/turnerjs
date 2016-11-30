/**
 * @class bootstrap.bootstrap.deploy.DeploymentDefinition
 */
define.bootstrapClass('bootstrap.bootstrap.deploy.DeploymentDefinition', function () {

    /**
     *
     * @constructor
     */

    function DeploymentDefinition() {
        this._phases_ = [];
    }

    /**
     * @lends bootstrap.bootstrap.deploy.DeploymentDefinition
     */
    DeploymentDefinition.extendPrototype({
        atPhase:function (phase, fn) {
            if(!(phase >= 0)){throw new Error('the phase that you are trying to load ['+phase+'] is not exist.\n Available Phases' + JSON.stringify(PHASES,null,4));}
            this._phases_[phase] = this._phases_[phase] || [];
            this._phases_[phase].push(fn);
        }
    });

    return DeploymentDefinition;
});
