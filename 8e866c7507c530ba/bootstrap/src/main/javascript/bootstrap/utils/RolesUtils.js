/**
 * @class bootstrap.utils.RolesUtils
 */
define.utils('RolesUtils', function(){
    return {
        stringifyRoles: function (rolesArray) {
            var roles = '';
            for (var i = 0; i < rolesArray.length; i++) {
                roles += rolesArray[i].role;
                i < rolesArray.length - 1 ? roles += ', ' : roles += '';
            }
            return roles;
        }
    }
});