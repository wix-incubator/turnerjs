import React, {Component} from 'react';
import {View, ListView, RefreshControl, Platform, Dimensions} from 'react-native';

import _ from 'lodash/fp';

import { Navigation, Screen, NavigationToolBarIOS} from 'react-native-navigation';

import styles from '../styles/ProductListStyles';

const itemsPerPage = 20;

const ds = new ListView.DataSource({
    rowHasChanged: (r1, r2) => r1 !== r2,
    sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});

const {width, height} = Dimensions.get('window');

class SmartList extends Component {
    constructor(props) {
        super(props);
        this.showedItems = itemsPerPage;

        this.state = {
            dataSource: this.getDataSource(this.props.data),
            bottomInset: (props.contentOffset || {}).bottom != null ? (props.contentOffset || {}).bottom :  0
        };
    }
    componentWillReceiveProps(nextProps){
        if (this.props.selectedCollection !== nextProps.selectedCollection) {
            this.scrollToTop();
        }

        this.setState({
            dataSource: this.getDataSource(nextProps.data, nextProps.searchString, nextProps.selectedCollection)
        });
    }
    getContentOffset() {
        return (this.props.contentOffset || {}).offsetY || -110;
    }
    getDataSource(data, searchString, optionalSelectedCollection){
        let _data = ds.cloneWithRowsAndSections([]);

        if (data && !_.keys(data.length || {}).length) {

            let res = this.props.filterFunction(data, searchString !== undefined ? searchString : this.props.searchString, optionalSelectedCollection);

            const allList = res.forList(this.showedItems);
            this.allSectionsAndProducts = allList[0];
            _data = ds.cloneWithRowsAndSections(...allList);
        }

        return _data;
    }
    scrollToTop(){
        this.listView && this.listView.scrollTo({y: -110, animated: false});
    }
    componentDidUpdate() {
        this.listView && this.listView.forceUpdate();
    }
    loadMore(data) {
        this.showedItems += itemsPerPage;
        this.setState({
            dataSource: this.getDataSource(data)
        });
    }
    onEndReached() {
        this.loadMore(this.props.data);
    }
    onItemPress(row){
        this.props.onItemPress(row);
    }
    render() {
        if (!this.props.isSearch && this.props.data && !Object.keys(this.props.data || {}).length) return this.props.renderEmptyScreen();

        const top = (this.props.contentOffset || {}).top !== undefined ? (this.props.contentOffset || {}).top : 110;

        const y = this.getContentOffset();
        const bottom = this.props.contentOffset.bottom;
        return (
            <View style={[
                    Platform.OS === 'ios' ? styles.mainView : {width: width, height: height - bottom - (this.props.isSearch ? 86 : 135)},
                    { backgroundColor: this.props.isSearch && !this.props.searchString ? '#fff' : '#f4f4f4'}
                ]}>
                <ListView
                    ref={r => { this.listView = r; }}
                    dataSource={this.state.dataSource}
                    keyboardShouldPersistTaps={true}
                    contentContainerStyle={[
                        this.props.style,
                        this.props.isSearch && !this.props.searchString ? {opacity: .2} : {}
                    ]}
                    pageSize={20}
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={!this.props.isSearch || !!this.props.searchString}
                    onEndReached={this.onEndReached.bind(this)}
                    renderRow={(row) => this.props.renderRow(row, this.allSectionsAndProducts)}
                    renderSeparator = {this.props.renderSeparator || this.renderSeparator.bind(this)}
                    renderSectionHeader={this.props.renderSectionHeader}
                    contentInset= {!this.props.skipOffset ? { top, bottom: this.props.contentOffset.bottom} : null}
                    contentOffset= {!this.props.skipOffset ? { y } : null}
                    onKeyboardDidHide={(e) => {
                        this.listView.scrollProperties.offset && this.listView.scrollTo({y: this.listView.scrollProperties.offset});
                    }}
                    refreshControl={!this.props.isSearch ? <RefreshControl
                        tintColor="#ffffff"
                        title=""
                        colors={['#1e90ff']}
                        progressBackgroundColor="#fff"
                        refreshing={this.props.isRefreshing}
                        onRefresh={this.props.onListRefresh}
                    /> : null}
                />
                {(this.props.isSearch && this.props.data && !Object.keys(this.props.data || {}).length) ? this.props.renderEmptyScreen(Platform.OS === 'ios' ? this.props.contentOffset.bottom : 0) : null}
            </View>
        );
    }
    renderSeparator(row, id) {
        return (<View style={styles.sep} key={'s' + id} />)
    }
}

export default SmartList;

