import {Alert, ActionSheetIOS, Platform} from 'react-native';

export default function (options, f) {
	if (Platform.OS === 'ios') {
		ActionSheetIOS.showActionSheetWithOptions(options, f);
	} else {
		Alert.alert(
			null,
			options.message || null,
			[
				{text: options.options[options.cancelButtonIndex], onPress: () => f(options.cancelButtonIndex)},
				{text: options.options[options.destructiveButtonIndex], onPress: () => f(options.destructiveButtonIndex)},
			]
		);
	}
}