import React, {Component} from 'react';

import {
	Image,
	Text,
	View,
	ListView,
	TextInput,
	TouchableOpacity,
	PixelRatio,
	Animated,
	Platform
} from 'react-native';

import { Navigation, Screen} from 'react-native-navigation';

import styles from '../styles/searchBarStyles';

export default class extends Component {
	constructor(props){
		super(props);
		this.state = {
			opacity: new Animated.Value(0),
		};
	}

	onChangeText(text){
		this.props.onSearchChanged && this.props.onSearchChanged(text);
	}

	clearSearch(){
		this.onChangeText('');
	}

	componentDidMount() {
		Animated.timing(this.state.opacity, {
			toValue: 1,
			duration: 400,
		}).start();
	}

	render() {
		const props = this.props;
		return (
			<View style={[styles.toolBarStyle, {top: 0}]}>
				<Animated.View style={[styles.container, {opacity: this.state.opacity}]}>
					<View style={styles.fieldHolder}>
						<TouchableOpacity onPress={props.cancelSearch}>
							<Image style={styles.searchIcon} source={require('../assets/arrowLeft.png')}/>
						</TouchableOpacity>
						<TextInput returnKeyType="search"
								   ref={(r) => {this.input = r;}}
								   selectTextOnFocus={true}
								   underlineColorAndroid="#ffffff"
								   selectionColor="#00adf5"
								   placeholder={`Search ${props.activeScreen ? 'products' : 'orders'}`}
								   placeholderTextColor="#b6c1cd"
								   value={`${this.props.searchString || ''}`}
								   onChangeText={this.onChangeText.bind(this)}
								   style={styles.input}
								   autoFocus={true}
								   onSubmitEditing={() => this.input.blur()}
						/>
					</View>
				</Animated.View>
			</View>
		)

	}
}