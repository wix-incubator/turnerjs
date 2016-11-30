/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/24/12
 * Time: 11:52 AM
 */
define.utils('testUtils:this', function(){

    return ({
        /** Function _$getUniqeId
         * Return the result id for the next request (for testing purposes ONLY!)
         * - prefix
         */
        instanceIndex: 0,
        _$getUniqeId : function (prefix) {
            var indexState = this.instanceIndex;
            var resultId = Utils.getUniqueId(prefix);
            this.instanceIndex = indexState;
            return resultId;
        }

    });

});