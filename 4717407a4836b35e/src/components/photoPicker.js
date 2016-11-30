import _ from 'lodash';
import {ModuleRegistry} from 'a-wix-react-native-framework';

export default function(){
    //const options = {
    //    message: 'Recent Images',
    //    takePhotoActionTitle: 'Take a Photo',
    //    pickPhotoActionTitle: 'Gallery',
    //    cancelActionTitle: 'Cancel',
    //    sendSelectedPhotosTitle: 'Send %lu Photo',
    //    aspectRatioInfoMessage: 'Your images look best with 16:9 ratio',
    //    aspectRatios: ["16:9", "1:1", "4:3", "3:2", "2:3", "3:4", "9:16"],
    //    collectionName: 'eCom'
    //};


    return ModuleRegistry.invoke('media.UploadImages', {color:'#00000077', ratios:['9:16', '1:1', '3:4', '4:3']}).then((urls) => {
            return urls.map((obj, ind) => {

                let file = _.first(_.values(obj));

                return {
                    index: ind,
                    url: file.file_name,
                    title: file.original_file_name,
                    height: file.height,
                    width: file.width,
                    mediaType: "PHOTO"
                }
            });
    });

}
