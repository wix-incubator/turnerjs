import React, {Component} from 'react';

import {
    Image,
    Text,
    View,
    ListView,
    TextInput,
    SegmentedControlIOS,
    TouchableOpacity,
    PixelRatio,
    Animated,
    Platform
} from 'react-native';

import { Navigation, Screen, NavigationToolBarIOS} from 'react-native-navigation';

import styles from '../styles/searchBarStyles';

export default class extends Component {
    constructor(props){
        super(props);

        this.state = {
            //searchText: '',
            opacity: new Animated.Value(0),
        };
    }
    onChangeText(text){
        //this.setState({
        //    searchText: text,
        //});

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
            <NavigationToolBarIOS style={[styles.toolBarStyle, {top: 0}]}>
                <Animated.View style={[styles.container, {opacity: this.state.opacity}]}>
                    <View style={styles.fieldHolder}>
                        <Image style={styles.searchIcon} source={require('../assets/searchIcon.png')}/>
                        <TextInput returnKeyType="search"
                                   selectionColor="#00adf5"
                                   placeholder={`Search ${props.activeScreen ? 'products' : 'orders'}`}
                                   placeholderTextColor="#aab7c5"
                                   value={`${this.props.searchString || ''}`}
                                   onChangeText={this.onChangeText.bind(this)}
                                   style={styles.input}
                                   autoFocus={true}

                        />
                        {(this.props.searchString || '').length ? <TouchableOpacity style={styles.clearButtonHolder} onPress={this.clearSearch.bind(this)}>
                            <Image style={styles.clearButton} source={require('../assets/searchClearButton.png')}/>
                        </TouchableOpacity> : null}
                    </View>
                    <TouchableOpacity onPress={props.cancelSearch}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                </Animated.View>
            </NavigationToolBarIOS>
        )

    }
}