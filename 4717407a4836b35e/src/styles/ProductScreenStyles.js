import {Dimensions, PixelRatio, Platform} from 'react-native';
import stylesBuilder from '../utils/stylesBuilder';
import commonStyles from './CommonStyles';
import * as Patterns from '../utils/patterns';

let deviceWidth = Dimensions.get('window').width;

function getSize(value) {
    return value/2;
}

const commonFontSize = 17;
const warningRed = '#ee5951';
const warningOrange = '#fb7d33';
const commonGray = '#e8e9ec';
const imageBgGray = '#eff1f2';
const textGray = '#a0afbf';
const textGreen = '#60bc57';
const textDarkGray = '#2d4150';
const defaultLight = '#ffffff';

const detailsLineHeight = Platform.OS === 'ios' ? 17 : 26;
const iosp = 25;
const andp = 20;
const commonContainerPadding = Platform.OS === 'ios' ? iosp : andp;

export default stylesBuilder({
    viewWrapper: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: defaultLight,
        sv: {
            flex: 1,
            imageContainer: {
                height: 225,
                paddingTop: Platform.OS === 'ios' ? iosp : 0,
            },
            imageContainerEdit: {
                position: 'relative',
                height: Platform.OS === 'ios' ? 250 : 225,
                paddingVertical: Platform.OS === 'ios' ? iosp : 0,
            },
            manageIcon: {
                position: 'absolute',
                top: Platform.OS === 'ios' ? 17 : 25,
                left: Platform.OS === 'ios' ? 42 : 25,
                icon: Patterns.OS({
                    'ios': {x: 25 , y: 18.5},
                    'android': {x: 30 , y: 27}
                }, ({x, y}) => ({
                    width: x,
                    height: y
                }))
            },
            titleSection: {
                cont: Patterns.Bool({
                    'true': (Platform.OS === 'ios' ? 22 : andp),
                    'false': (Platform.OS === 'ios' ? iosp : andp)
                }, (x) => ({
                    paddingBottom: x,
                    paddingTop: Platform.OS === 'ios' ? 30 : andp
                })),
                name: {
                    fontWeight: '300',
                    fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
                    fontSize: Platform.OS === 'ios' ? 27 : 28,
                    lineHeight: Platform.OS === 'android' ? 40  : undefined,
                    color: textDarkGray
                },
                coll: {
                    fontSize: 14,
                    lineHeight: 20,
                    color: textGray
                }
            },
            description: {
                paddingBottom: commonContainerPadding,
                text: {
                    fontSize: commonFontSize,
                    lineHeight: Platform.OS === 'ios' ? 22 : 30,
                    letterSpacing: 0.3,
                    fontWeight: '200',
                    color: textDarkGray
                }
            },
            paddingContainer: {
                paddingHorizontal: Platform.OS === 'ios' ? iosp : undefined
            }
        },
        paddingIosHor: {
            paddingHorizontal: iosp
        },
        paddingIosVer: {
            paddingVertical: iosp
        },
        deleteButton: {
            fontSize: commonFontSize,
            color: warningRed,
        },
        sep: {
            borderTopWidth: 1,
            borderTopColor: commonGray,
            height: 0
        },
        sepWithPadding: {
            borderTopWidth: 1,
            borderTopColor: commonGray,
            height: 0,
            paddingBottom: commonContainerPadding
        },
        container: {
            paddingHorizontal: commonContainerPadding,
            backgroundColor: defaultLight
        }
    },
    photoGallery: {
        editPhoto: Patterns.OS({
            'ios': { h: 200, w: deviceWidth - 50, m: iosp },
            'android': { h: 250, w: deviceWidth, m: 0 }
        }, ({h, w, m}) => ({
            height: h,
            width: w,
            marginLeft: m,
        })),
        noMedia: {
            height: Platform.OS === 'ios' ? 200 : 225,
            width: Platform.OS === 'ios' ? deviceWidth - 50 : deviceWidth,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: imageBgGray,
            marginLeft: Platform.OS === 'ios' ? iosp : 0,
            borderRadius: Platform.OS === 'ios' ? 2 : 0,
            overflow: 'hidden',
            placeHolder: {
                width: 325.5,
                height: 203.5
            }
        },
        ribbonCont: {
            position: 'absolute',
            height: 25,
            backgroundColor: textDarkGray,
            ...(Platform.OS === 'ios' ? {top: 15} : {bottom: 35}),
            paddingHorizontal: 15,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            text: {
                color: defaultLight,
                fontSize: 16,
                fontWeight: '300',
                fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined
            }
        }
    },
    iaContainer: {
        wrapper: Patterns.Bool({
            'true': 10,
            'false': 20
        }, (x) => ({
            paddingBottom: Platform.OS === 'ios' ? iosp : x,
            flexDirection: 'row',
            alignItems: 'center'
        })),
        price: Patterns.Bool({
            in_stock: textGreen,
            partially_out_of_stock: textGreen,
            out_of_stock: textGray
        }, (color) => ({
            fontSize: commonFontSize,
            lineHeight: detailsLineHeight,
            color
        })),
        vLine: {
            width: 1,
            height: 12,
            backgroundColor: commonGray,
            marginHorizontal: 17.5,
            marginBottom: 1
        },
        inventoryStatus: Patterns.Bool({
            in_stock: textGray,
            partially_out_of_stock: warningOrange,
            out_of_stock: warningRed
        }, color => ({
            fontSize: commonFontSize,
            lineHeight: detailsLineHeight,
            color
        })),
        outOfStock: {
            fontSize: commonFontSize,
            lineHeight: detailsLineHeight,
            color: warningRed
        },
        inStock: {
            fontSize: commonFontSize,
            lineHeight: detailsLineHeight,
            color: textGray
        }
    },
    preloader: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexPreloader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: defaultLight
    }
});
