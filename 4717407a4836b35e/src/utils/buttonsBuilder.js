import {Platform} from 'react-native';

export default function (buttons) {
	return Platform.OS === 'ios' ?
		buttons :
		{...buttons,
			leftButtons: [],
			rightButtons: [
				...buttons.rightButtons,
				...(buttons.leftButtons || [])
			]
		}
} 