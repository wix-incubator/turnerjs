import React, {Component} from 'react';
import {View, Image } from 'react-native';

import CommonActivityIndicator from './CommonActivityIndicator';

import topology from '../utils/Topology';
import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';

const wixMediaApi = WixMediaApi(topology.staticMediaUrl);


export default class ImageWithPreloader extends Component {
    constructor(props){
        super(props);

        this.state = {
            isLoaded: false
        }
    }
    render() {
        return (
            <View style={this.props.style}>
                <Image
                    style={{flex: 1, borderRadius: 2, overflow: 'hidden'}}
                    source={{uri: wixMediaApi.imageFill(this.props.source, 750, 480)}}
                    onLoadEnd = {(e) => {

                        this.setState({
                            isLoaded: true
                        });
                    }}
                    onProgress={(e) => {

                        if (e.nativeEvent.loaded === e.nativeEvent.total) {

                            this.setState({
                                isLoaded: true
                            })
                        }
                    }}
                />
                {!this.state.isLoaded && <View style={styles.absolutePreloader}>
                        <CommonActivityIndicator
                          size={this.props.size || 'large'}
                          style={{backgroundColor: 'transparent'}}
                        />
                    </View>}
            </View>
        )
    }
}

const styles = {
    absolutePreloader: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center'
    }
}
