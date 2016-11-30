define.utils("EditorErrorUtils", function () {
    return ({

        getErrorMsg:function (errorCode, defaultMsgKey) {
            var positiveErrorCode = errorCode < 0 ? errorCode * (-1) : errorCode;
            var errorObj = this.getServerError(positiveErrorCode);
            if (errorObj) {
                return this._buildErrorMsg(positiveErrorCode, errorObj);
            }
            return W.Resources.get('EDITOR_LANGUAGE', defaultMsgKey) + ' (' + errorCode + ')';
        },

        getServerError:function (errorCode) {
            return W.Data.getDataByQuery('#SERVER_ERRORS').getData().errors["ERR_" + errorCode] || null;
        },
//        errorExits:function (errorCode) {
//            return W.Data.getDataByQuery('#SERVER_ERRORS').getData().errors["ERR_" + errorCode] ? true : false;
//        },
        _buildErrorMsg:function (errorCode, errorObj) {
            var resources = W.Resources;
            var msg = resources.get('EDITOR_LANGUAGE', 'ERR_ERROR') + errorCode + "</br>";
            var description = resources.replacePlaceholders('EDITOR_LANGUAGE', errorObj.msgDescription);
            var supportLink = resources.replacePlaceholders('EDITOR_LANGUAGE', errorObj.supportLink);
            var linkText = resources.replacePlaceholders('EDITOR_LANGUAGE', errorObj.msgLinkText);
            var follow = resources.replacePlaceholders('EDITOR_LANGUAGE', errorObj.msgFollow);

            msg += description + ' ';
            msg += '<a href="' + supportLink + '" target="blank">' + linkText + '</a>' + '. ';
            msg += follow;

            return msg;
        }
    });
});
