import React, {Component} from 'react';
import {
    Text,
    View,
    ListView,
    TouchableOpacity,
    PixelRatio,
    Dimensions,
    Image,
    LayoutAnimation,
    Animated,
    RefreshControl,
    Platform
} from 'react-native';

import BlurView from './CommonBlurView';
import _ from 'lodash/fp';

import { connect } from 'react-redux';
import * as stateReader from '../reducers/stateReader';
import * as collectionActions from '../actions/collectionsActions';
import * as appActions from '../actions/appActions';


import CommonActivityIndicator from './CommonActivityIndicator';

var {height, width} = Dimensions.get('window');

var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});


const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

class Collections extends Component {
    constructor(props){
        super(props);

        !this.props.isCollectionsListLoading && !this.props.collections && this.props.dispatch(collectionActions.loadCollections());

        this.state = {
            opacity: new Animated.Value(0)
        };
    }
    onCollectionPress(collectionId){
        if (collectionId !==  this.props.selectedCollection) {
            this.props.dispatch(collectionActions.selectCollection(collectionId));

            Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: 400,
            }).start(() => {
                this.props.onClose();
            });
        } else {
            this.props.onClose();
        }
    }
    loadCollections() {
        this.props.dispatch(collectionActions.loadCollections());
    }
    renderRow(rowData){
        const isSelected = this.props.selectedCollection === rowData.id;
        return (
            <TouchableOpacity onPress={() => {this.onCollectionPress(rowData.id)}}>
                <View style={styles.row}>
                    <Text style={[styles.rowText, isSelected ? {fontWeight: '600'} : {}, {flex:1}]} numberOfLines={1}>{rowData.name}</Text>
                    {
                        isSelected ? <Image style={{width: 16.5, height: 14}} source={require('../assets/checkmark.png')}/> : null
                    }
                </View>
            </TouchableOpacity>
        )

    }
    componentDidMount() {
        Animated.timing(this.state.opacity, {
            toValue: 1,
            duration: 400,
        }).start();
    }
    render(){
        return (
            <AnimatedBlurView blurType="light" style={[styles.collections, {opacity: this.state.opacity}]}>
                <View style={{flex: 1}}>
                    <ListView
                        contentContainerStyle={styles.listView}
                        dataSource={ds.cloneWithRows(this.props.collections || {}, Object.keys(this.props.collections || {}))}
                        renderRow={this.renderRow.bind(this)}
                    />
                    {
                        this.props.isCollectionsListLoading && !this.props.collections ? (
                            <View style={styles.absolutePreloader}>
                                <CommonActivityIndicator
                                  size="large"
                                  style={{backgroundColor: 'transparent'}}
                                />
                            </View>
                        ) : null
                    }
                </View>
            </AnimatedBlurView>
        )
    }
}

const {height, width} = Dimensions.get('window');
const styles = {
    collections: {
        flex: 1,
        position: 'absolute',
        left: 0,
        top: Platform.OS === 'ios' ? 66 : 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 1/PixelRatio.get(),
        borderTopColor: '#dedede',
        backgroundColor: 'transparent'
    },
    absolutePreloader: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listView: {
        paddingHorizontal: 20
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1/PixelRatio.get(),
        borderBottomColor: '#dedede'
    },
    rowText: {
        fontWeight: '200',
        fontSize: 17,
        color: '#2d4150'
    }
};


function mapStateToProps(state) {
    return {
        isCollectionsListLoading: stateReader.getCollectionsListUpdateStatus(state),
        collections: stateReader.getCollections(state),
        selectedCollection: stateReader.getSelectedCollection(state)
    };
}

export default connect(mapStateToProps)(Collections);