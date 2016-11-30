import React, {Component} from 'react';
import {Text, View, ListView, TextInput} from 'react-native';

import _ from 'lodash/fp';

import styles from '../styles/ProductListStyles';

export default class SearchList extends Component{
    constructor(props){
        super(props);

        this.state = {
            searchHidden: true,
            scrollOffset: 50
        }
    }
    componentDidMount(){
        this.refs.scrollList.scrollResponderScrollTo({x: 0, y: 50, animated: false});
    }
    onScrollBeginDrag(){
        this.startDrag = this.state.scrollOffset;
    }
    onScrollEndDrag(){
        let endDrag = this.startDrag - this.refs.scrollList.scrollProperties.offset,
            offset = this.refs.scrollList.scrollProperties.offset;

        if (endDrag < 0) {
            if (offset < 50 && offset > 30) {
                this.refs.scrollList.scrollResponderScrollTo({x: 0, y: 50});
            }
        }
        if (endDrag > 0) {
            if (offset < 50 && offset > 30) {
                this.refs.scrollList.scrollResponderScrollTo({x: 0, y: 50});
            } else if (offset < 30) {
                this.refs.scrollList.scrollResponderScrollTo({x: 0, y: 0});
            }
        }

        this.setState({
            scrollOffset: this.refs.scrollList.scrollProperties.offset
        });

    }
    search(val){
        this.props.search(val);
    }
    render(){
        return (
            <ListView
                ref="scrollList"
                //renderRow={this.props.renderRow}
                //renderSeparator = {this.props.renderSeparator}
                renderHeader = {this.renderHeader.bind(this)}
                //style={this.props.style}
                //dataSource={this.props.dataSource}
                onScrollBeginDrag={this.onScrollBeginDrag.bind(this)}
                onScrollEndDrag={this.onScrollEndDrag.bind(this)}
                onMomentumScrollBegin={()=> {}}
                onMomentumScrollEnd={()=> {}}
                {...this.props}
            />
        );
    }
    renderHeader(){
        return (
            <View style={styles.searchBar}>
                <TextInput style={styles.searchBarInput} placeholder="Search" onChangeText={this.search.bind(this)}/>
            </View>
        )
    }
}

