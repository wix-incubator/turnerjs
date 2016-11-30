import React, {Component} from 'react';
import {
	Text,
	View,
	Switch,
	ScrollView,
	Image,
	TouchableOpacity,
	TextInput
} from 'react-native';

import Collections from '../components/Collections';

import styles from '../styles/ProductViewStyles';

import * as CONSTANTS from '../utils/constants';
import buttonsBuilder from '../utils/buttonsBuilder';

export default class CollectionsScreen extends Component {
	constructor(props) {
		super(props);
	}
	hideCollections() {
		this.props.navigator.pop();
	}
	render() {
		return (
			<View style={styles.mainView}>
				<Collections onClose={this.hideCollections.bind(this)}/>
			</View>
		)
	}
}