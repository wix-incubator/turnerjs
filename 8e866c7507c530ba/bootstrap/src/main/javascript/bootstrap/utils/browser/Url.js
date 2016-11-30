/**
 * Created by IntelliJ IDEA.
 * User: baraki
 * Date: 5/22/12
 * Time: 12:29 PM
 */

define.utils('Url', function () {
    return ({
        getSearchParamString: function (windowScope) {
            windowScope = windowScope || window;
            return windowScope.location.search;
        }
    });
});