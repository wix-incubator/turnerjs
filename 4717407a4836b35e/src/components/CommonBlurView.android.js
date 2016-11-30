import React, {Component} from 'react';
import {View, Dimensions} from 'react-native';

export default class BlurView extends Component {
	constructor(props) {
		super(props);
	}
	render(){
		return (
			<View style={[this.props.style, {backgroundColor: '#f4f4f4'}]}>
				{this.props.children}
			</View>
		)
	}
}
