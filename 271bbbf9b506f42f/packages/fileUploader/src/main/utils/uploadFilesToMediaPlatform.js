define(['coreUtils'], function () {
    'use strict';

    //var requestsUtil = coreUtils.requestsUtil;

    //function uploadFileToMediaPlatform (file, upload_token) {
    //    //var formData = new FormData();
    //    //formData.set('upload_token', upload_token);
    //    //formData.set('media_type', mediaType); 		// mediaType = 'picture'
    //    //formData.append('file', file);
    //    //formData.append('siteMediaToken', ...);
    //
    //    var request = new XMLHttpRequest();
    ////...
    //    request.open('POST', upload_url);
    //}

    function getUploadUrlAndSendFile (file, authorizationToken) {
        authorizationToken = authorizationToken || 'fakeToken';

        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                //console.log(request.responseText);
                //console.log(request.responseXML);
                //console.log(request.response);
            }
        };

        request.open("GET", 'https://files.wix.com/files/upload/url');
        request.setRequestHeader('Authorization', authorizationToken); //'authorization token received in rendererModel'
        request.setRequestHeader('Accept', 'application/json');
        request.setRequestHeader('Content-Type', 'application/json');
        //request.setRequestHeader('media-type', 'picture');
        request.send(null);
    }

    return {
        upload: getUploadUrlAndSendFile
    };
});
