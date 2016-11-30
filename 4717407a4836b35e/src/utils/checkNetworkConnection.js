import { NetInfo, AlertIOS } from 'react-native';

export default function(noConnectionMessage='Changes won\'t be saved, check your network connection settings or try later') {
    return new Promise((resolve, reject) => {
        NetInfo.isConnected.fetch().then(isConnected => {
            if (isConnected) {
                resolve();
            } else {
                AlertIOS.alert(
                    'No network connection',
                    noConnectionMessage
                );
                reject('No network connection');
            }
        });
    });
}