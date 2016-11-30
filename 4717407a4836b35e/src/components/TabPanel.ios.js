import React, {Component} from 'react';

import {
    Text,
    View,
    ListView,
    TextInput,
    SegmentedControlIOS,
    TouchableOpacity,
    RecyclerViewBackedScrollView,
    StyleSheet,
    PixelRatio,
} from 'react-native';

import { Navigation, Screen, NavigationToolBarIOS} from 'react-native-navigation';
import { CustomSegmentedControl } from 'react-native-custom-segmented-control'
import SearchBar from './SearchBar';

import styles from '../styles/ProductListStyles';
import * as CONSTANTS from '../utils/constants';

export default class extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected: props.activeScreen
        }
    }
    componentWillReceiveProps(nextProps){
        if (nextProps.isSearch !== this.props.isSearch) {
            this.setState({
                selected: this.props.activeScreen
            })
        }
    }
    render(){
        const props = this.props;

        return (
            <View style={{flex: 1}}>
                {props.activeScreen
                    ? props.renderProductList()
                    : props.renderOrderList()
                }
                {!props.isSearch ?
                    <NavigationToolBarIOS key='segmented' translucent={true} style={styles.toolBarStyle}>
                        <CustomSegmentedControl
                            style={{flex:1, backgroundColor: 'transparent', marginTop: 20}}
                            textValues={[CONSTANTS.ORDERS_SEGMENT_TITLE, CONSTANTS.PRODUCTS_SEGMENT_TITLE]}
                            selected={this.state.selected}
                            segmentedStyle={{
                           lineSelectedHeight: 3,
                           fontSize: 14,
                           fontWeight: 'regular',
                           segmentBackgroundColor: 'transparent',
                           segmentTextColor: '#7a92a5',
                           segmentFontFamily: 'system-font-bold',
                           selectedLineColor: '#00adf5',
                           selectedLineAlign: 'bottom', // top/bottom/text
                           selectedLineMode: 'text', // full/text
                           selectedLinePaddingWidth: 20
                        }}
                            animation={{
                            duration: 0.75,
                            damping: 0.6,
                            animationType: 'middle-line',
                            initialDampingVelocity: 0.0
                        }}
                        onSelectedWillChange={(event)=> {
                            props.switchScreen(event.nativeEvent.selected);
                        }}>
                        </CustomSegmentedControl>

                        <View style={{ backgroundColor: '#dedede', height: 1/PixelRatio.get()}}/>
                        <View style={{ top: -44, backgroundColor: '#dedede', height: 1/PixelRatio.get()}}/>
                    </NavigationToolBarIOS>
                    : <SearchBar {...props}/>
                }
                {props.openCollections ? props.renderCollections() : null}
            </View>
        )
    }
}

//export default (props) => {
//    return (
//        <View style={{flex: 1}}>
//            {props.activeScreen
//                ? props.renderProductList()
//                : props.renderOrderList()
//            }
//            {!props.isSearch ?
//                <NavigationToolBarIOS key='segmented' translucent={true} style={styles.toolBarStyle}>
//                    <CustomSegmentedControl
//                        style={{flex:1, backgroundColor: 'transparent', marginTop: 20}}
//                        textValues={['ORDERS', 'PRODUCTS']}
//                        selected={0}
//                        segmentedStyle={{
//                           lineSelectedHeight: 3,
//                           fontSize: 14,
//                           fontWeight: 'regular',
//                           segmentBackgroundColor: 'transparent',
//                           segmentTextColor: '#7a92a5',
//                           segmentFontFamily: 'system-font-bold',
//                           selectedLineColor: '#00adf5',
//                           selectedLineAlign: 'bottom', // top/bottom/text
//                           selectedLineMode: 'text', // full/text
//                           selectedLinePaddingWidth: 20
//                        }}
//                        animation={{
//                            duration: 0.75,
//                            damping: 0.6,
//                            animationType: 'middle-line',
//                            initialDampingVelocity: 0.0
//                        }}
//                        onSelectedWillChange={(event)=> {
//                            props.switchScreen(event.nativeEvent.selected);
//                        }}>
//                    </CustomSegmentedControl>
//
//                    <View style={{ backgroundColor: '#dedede', height: 1/PixelRatio.get()}}/>
//                    <View style={{ top: -44, backgroundColor: '#dedede', height: 1/PixelRatio.get()}}/>
//                </NavigationToolBarIOS>
//                : <SearchBar {...props}/>
//            }
//            {props.openCollections ? props.renderCollections() : null}
//        </View>
//    )
//};
