import React, {Component} from 'react';
import { Text, View, Image, Platform } from 'react-native';
import CommonActivityIndicator from './CommonActivityIndicator';

import styles from '../styles/ProductListStyles';
import loadingStyles from '../styles/loadingScreenStyles';
import * as CONSTANTS from '../utils/constants';

export default class ProductListScreen extends Component {
    render() {
        if (!this.props.isModuleLoaded) {
            return this.renderLoadingScreen();
        } else if (!this.props.isAppFound) {
            return this.renderAppNotFoundScreen();
        } else if (this.props.isLoading) {
            return this.preloadListScreen()
        }

        return this.props.children;
    }

    renderLoadingScreen() {
        return (
            <View style={loadingStyles.mainView}>
                <CommonActivityIndicator
                  size="large"
                  style={{backgroundColor: 'transparent'}}
                />
            </View>
        )
    }

    renderAppNotFoundScreen() {
        return (
            <View style={[styles.mainView, styles.emptyList]}>
                <Image style={{width: 141, height: 162}} source={require('../assets/notFound.png')}/>
                <Text style={styles.emptyListHeader}>{CONSTANTS.APP_NOT_FOUND_HEADER}</Text>
                <Text style={styles.emptyListSubHeader}>{CONSTANTS.APP_NOT_FOUND_SUB_HEADER}</Text>
            </View>
        );
    }
    preloadListScreen(){
        return (
            <View style={[styles.mainView]}>
                {this.props.children}
                <View style={[styles.absolutePreloader, Platform.OS === 'ios' ? {top: 110}: {}]}>
                    <CommonActivityIndicator
                      size="large"
                      style={{backgroundColor: 'transparent'}}
                    />
                </View>
            </View>
        )
    }
}