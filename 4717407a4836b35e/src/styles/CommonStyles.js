import {Dimensions, PixelRatio} from 'react-native';
import stylesBuilder from '../utils/stylesBuilder';

let deviceWidth = Dimensions.get('window').width;

function getSize(value) {
	return value/2;//PixelRatio.get();
}

export default {
	flexRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	}
};