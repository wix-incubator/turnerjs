import React, {Component} from 'react';
import {
    ScrollView,
    Text,
    View,
    Image,
    TouchableHighlight,
    Dimensions,
    Animated,
    Platform,
    ViewPagerAndroid
} from 'react-native';

import ImageWithPreloader from './ImageWithPreloader';

const width = Dimensions.get('window').width;

export default class Carousel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0
        }
    }
    render(){
        const containerPaddings = 25;
        const containerWidth = width - containerPaddings * 2;
        const itemWidth = width - containerPaddings * 2;
        const itemPaddings = containerPaddings/2;


        if (Platform.OS === 'ios') {
            return (
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    style={{
                        width: containerWidth + itemPaddings,
                        flexDirection: 'row',
                        height: 200,
                        overflow: 'visible',
                        marginLeft: containerPaddings - itemPaddings/2
                    }}
                    horizontal={true}
                    pagingEnabled={true}
                    bounces={false}
                    removeClippedSubviews={false}
                    showsPagination={true}
                >
                    {this.props.media.map((mediaObj, index) => {

                        return (
                            <View
                                key={`s_${index}`}
                                style={{
                                    width: itemWidth + itemPaddings,
                                    height: 200,
                                    paddingHorizontal: itemPaddings/2,
                                    //backgroundColor: '#f00'
                                }}
                            >
                                <ImageWithPreloader
                                    style={{
                                        width: itemWidth,
                                        height: 200,
                                    }}
                                    source={mediaObj.url}
                                />
                                {this.props.ribbon ? (
                                    <View style={{
                                        position: 'absolute',
                                        height: 25,
                                        backgroundColor: '#2b5672',
                                        top: 15,
                                        paddingHorizontal: 15,
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{
                                            color: '#fff',
                                            fontSize: 16,
                                        }}>{this.props.ribbon}</Text>
                                    </View>
                                ) : null}
                            </View>

                        )
                    })}
                </ScrollView>
            )
        } else {
            return (
                <View>
                    <ViewPagerAndroid style={{height: 225, width: width}} initialPage={0} onPageSelected={e => this.setState({index: e.nativeEvent.position})}>
                        {this.props.media.map((mediaObj, index) => {
                            return (
                                <View
                                    key={`s_${index}`}
                                    style={{
                                        width: width,
                                        height: 225
                                        //backgroundColor: '#f00'
                                    }}
                                >
                                    <ImageWithPreloader
                                        style={{
                                            width: width,
                                            height: 225,
                                        }}
                                        source={mediaObj.url}
                                    />
                                </View>
                            )
                        })}
                    </ViewPagerAndroid>
                    {this.props.ribbon ? (
                        <View style={{
                            position: 'absolute',
                            height: 25,
                            backgroundColor: '#2b5672',
                            bottom: 35,
                            paddingHorizontal: 15,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: '300',
                                fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
                                }}>{this.props.ribbon}</Text>
                        </View>
                    ) : null}
                    <View style={{position:'absolute', bottom:20, height: 10, width: width, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        {(this.props.media && ((this.props.media.length > 1) && this.props.media)|| []).map((item, index) => {
                            return (
                                <View key={`m_${index}`}
                                    style={{
                                        width: index === this.state.index ? 15 : 10,
                                        height: index === this.state.index ? 15 : 10,
                                        marginRight: 5,
                                        marginLeft: 5,
                                        borderRadius: 10,
                                        backgroundColor: index === this.state.index ? '#ffffff' : '#ffffff'
                                    }}></View>
                            );
                        })}
                    </View>
                </View>
            );
        }
    }
}