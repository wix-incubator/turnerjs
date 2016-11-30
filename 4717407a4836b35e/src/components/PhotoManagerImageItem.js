import React, {Component} from 'react';
import {
    View,
    Image,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Animated,
    Platform
} from 'react-native';

import CommonActivityIndicator from './CommonActivityIndicator';
import topology from '../utils/Topology';
import { WixMediaApi, WixMediaImage } from 'react-native-wix-media';

const wixMediaApi = WixMediaApi(topology.staticMediaUrl);


export default class PhotoManagerImageItem extends Component {
    constructor(props){
        super(props);

        this.state = {
            pressed: false,
            opacity: new Animated.Value(1),
            fadeAnim: new Animated.Value(0),
            changeOpacity: new Animated.Value(0),
            changeTransform: new Animated.Value(0),
            isActive: false,
        };

        this.isActive = false;
    }
    animateOpacity(backward) {
        Animated.timing(this.state.opacity, {
            toValue: backward ? 1 : 0,
            duration: 100,
        }).start();
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.source !== this.props.source){
            this.setState({
                change: null,
                changeOpacity: new Animated.Value(0),
            })
        }
    }
    onLongPress(e){
        const { pageX, pageY } = e;
        this.setState({
            pressed: true
        });

        this.comp.measure( (fx, fy, width, height, px, py) => {
            this.animateOpacity();
            this.props.onLongPress && this.props.onLongPress({
                pageX,
                pageY,
                itemProps: this.props,
                layout: {
                    ...this.layout,
                    px, py
                },
                item: this
            });
        });
    }
    getComp() {
        return this.comp;
    }
    animationToLeft(resolve){
        this.state.changeTransform.setValue(-this.layout.width);

        Animated.parallel([
            Animated.timing(this.state.changeOpacity, {
                toValue: 1,
                duration: 200
            }),
            Animated.timing(this.state.changeTransform, {
                toValue: 0,
                duration: 200
            })
        ]).start((e) => {
            resolve();
        });
    }
    animationToRight(resolve){
        this.state.changeTransform.setValue(this.layout.width);

        Animated.parallel([
            Animated.timing(this.state.changeOpacity, {
                toValue: 1,
                duration: 200
            }),
            Animated.timing(this.state.changeTransform, {
                toValue: 0,
                duration: 200
            })
        ]).start((e) => {
            resolve();
        });
    }
    animationFadeIn(resolve){
        Animated.timing(this.state.changeOpacity, {
            toValue: 1,
            duration: 200
        }).start((e) => {
            resolve();
        });
    }
    animateChange(item, direction) {
        this.setState({
            change: item
        });

        return new Promise((resolve, reject) => {
            switch (direction) {
                case 0:
                    this.animationToLeft(resolve);
                    break;
                case 1:
                    this.animationToRight(resolve);
                    break;
                default:
                    this.animationFadeIn(resolve);
            }
        });
    }
    setActive(isActive, toLeft){
        if (!this.state.pressed && this.isActive !== isActive) {
            this.isActive = isActive;
            Animated.timing(this.state.fadeAnim, {
                toValue: isActive ? (toLeft ? -15 : 15) : 0,
                duration: 50,
            }).start();
        }
    }
    onLayout({layout}) {
        this.layout = layout;
    }
    onPressOut(){
        if (this.state.pressed && this.props.shouldPressOut()){
            this.setState({pressed: false});
            this.props.onPressOut && this.props.onPressOut();
            this.animateOpacity(true);
        }
    }
    render() {
        return (
            <View ref={(c) => { this.comp = c }}
                  style={[this.props.style]}
                  onLayout={(e) => this.onLayout(e.nativeEvent)}
            >
                <Animated.View style={{
                    flex: 1,
                    transform: [{
                        translateX: this.state.fadeAnim,
                    }],
                }}>
                    <TouchableWithoutFeedback
                        onLongPress={(e) => this.onLongPress(e.nativeEvent)}
                        onPressOut={(e) => this.onPressOut()}
                    >
                        {!this.state.change ? (
                            <Animated.Image
                                style={[{flex: 1,
                                        borderRadius: 2,
                                        borderWidth: 0.5,
                                        borderColor: '#e9e9e9'}, {
                                    opacity: this.state.opacity,
                                    borderRadius: 2
                                }]}
                                source={{uri: wixMediaApi.imageFill(this.props.source, 750, 480)}}
                            />
                        ) : (
                            <Animated.Image
                                style={[{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        bottom: 0,
                                        left: 0,
                                        borderRadius: 2,
                                        borderWidth: 0.5,
                                        borderColor: '#e9e9e9'
                                    }, {
                                    opacity: this.state.changeOpacity,
                                    transform: [{
                                        translateX: this.state.changeTransform,
                                    }],
                                }]}
                                source={{uri: wixMediaApi.imageFill(this.state.change.url, 750, 480)}}
                            />
                        )}
                    </TouchableWithoutFeedback>
                    {!this.state.pressed && !this.props.withoutDelete ? (
                        <TouchableOpacity
                            style={{
                                    position: 'absolute',
                                    top: Platform.OS === 'ios' ? -12 : 4,
                                    right: Platform.OS === 'ios' ? -12 : 4,
                                    width: 25,
                                    height: 25
                                }}
                            onPress={() => this.props.onDelete(this.props.index)}>
                            <Image
                                style={{flex: 1}}
                                source={require('../assets/removePhoto.png')}/>
                        </TouchableOpacity>
                    ) : null}
                </Animated.View>
            </View>
        )
    }
}

