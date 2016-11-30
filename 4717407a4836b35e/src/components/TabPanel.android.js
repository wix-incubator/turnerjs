import React, {Component} from 'react';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import SearchBar from './SearchBar';
import * as CONSTANTS from '../utils/constants';

export default (props) => {
    return (
        <View style={{flex: 1}}>
            {!props.isSearch ?
                <View style={styles.tabHeader}>
                    <TouchableOpacity
                        style={[styles.tab, !props.activeScreen ? styles.tabActive : {}]}
                        onPress={(e) => {
                        props.activeScreen && props.switchScreen(0);
                    }}
                    >
                        <Text style={[styles.tabText, !props.activeScreen ? styles.tabActiveText : {}]}>{CONSTANTS.ORDERS_SEGMENT_TITLE}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, props.activeScreen ? styles.tabActive : {}]}
                        onPress={(e) => {
                        !props.activeScreen && props.switchScreen(1);
                    }}
                    >
                        <Text style={[styles.tabText, props.activeScreen ? styles.tabActiveText : {}]}>{CONSTANTS.PRODUCTS_SEGMENT_TITLE}</Text>
                    </TouchableOpacity>
                </View>
                : <SearchBar {...props}/>
            }
            {props.activeScreen
                ? props.renderProductList()
                : props.renderOrderList()
            }
            {props.openCollections ? props.renderCollections() : null}
        </View>
    );
}


//<TabLayout
//    style={styles.tabLayout}
//    selectedTab={props.activeScreen}
//    onTabSelected={(e) => {
//            props.switchScreen(e.nativeEvent.position);
//        }}>
//    <Tab name="Orders" accessibilityLabel={'Orders'} style={styles.tab}/>
//    <Tab name="Products" accessibilityLabel={'Products'} style={styles.tab}/>
//</TabLayout>

const styles = StyleSheet.create({
    tabHeader: {
        height: 55,
        backgroundColor: '#00adf5',
        flexDirection: 'row'
    },
    tab: {
        flex: .5,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#ccd0f0',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#ffffff',
    },
    tabActiveText: {
        color: '#ffffff',
    }
});