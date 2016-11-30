import {Dimensions, PixelRatio, Platform} from 'react-native';
import { transformStyles } from '../utils/stylesBuilder';
import stylesBuilder from '../utils/stylesBuilder';
import * as Patterns from '../utils/patterns';
import commonStyles from './CommonStyles';

const deviceWidth = Dimensions.get('window').width;

const errorColor = '#ff0000';
const warningRed = '#ee5951';
const commonGray = '#e8e9ec';
const imageBgGray = '#eff1f2';
const textGray = '#a0afbf';
const textDarkGray = '#2d4150';
const defaultLight = '#ffffff';
const blueColor = '#00adf5';
const labelGray = '#b6c1cd';
const topBorderGray = '#dedede';

const textGreen = '#60bc57';

const commonFontSize = 17;

const iosp = 25;
const andp = 20;
const viewContainerPadding = 0;//Platform.OS === 'ios' ? 0 : andp;
const linePaddingHor = Platform.OS === 'ios' ? undefined : andp;
const verticalPadding = Platform.OS === 'ios' ? 25 : 20;


function getSize(value) {
    return value/2;//PixelRatio.get();
}

let horisontalPaddings = {
    paddingRight: getSize(50),
    paddingLeft: getSize(50)
};

const separator = {
  borderBottomWidth: 0.5,
  borderBottomColor: commonGray
};

export default transformStyles({
    wrapper: {
        flex: 1,
        backgroundColor: defaultLight
    },
    scrollView: {
        ...(Platform.OS === 'ios' ? horisontalPaddings : {}),
        flex: 1,
        flexDirection: 'column'
    },
    summary: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        paddingTop: getSize(68),
        paddingBottom: getSize(42),
        ...separator,
        total: {
            fontSize: getSize(54),
            fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
            fontWeight: '300',
            color: textDarkGray,
            marginBottom: getSize(12)
        },
        date: {
            fontSize: commonFontSize,
            fontWeight: '300',
            color: textDarkGray
        }
    },
    status: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        paddingTop: getSize(50),
        paddingBottom: getSize(50),
        ...separator,
        wrapper: {
            ...(deviceWidth > 350 ?
                commonStyles.flexRow
                : {
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
              }
            )
        },
        lineWrapper: Patterns.Bool({
              'true': deviceWidth > 350 ? getSize(8) : undefined,
              'false': undefined
          }, margin => ({
            ...commonStyles.flexRow,
            marginBottom: margin
          })
        ),
        paymentMargin: {
            ...(deviceWidth > 350 ? {} : { marginBottom: getSize(8) })
        },
        text: Patterns.Bool({
            '0': textGreen,
            '1': warningRed,
            'false': undefined
        }, color => ({
                fontWeight: '400',
                fontSize: commonFontSize,
                color
            })
        ),
        green: {
            color: textGreen
        },
        red: {
            color: warningRed
        }
    },
    items: {
        paddingVertical: getSize(43),
        ...separator,
        item: {
            ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
            ...commonStyles.flexRow,
            marginBottom: getSize(15),
            marginTop: getSize(15),
            image: {
                width: getSize(140),
                height: getSize(140),
                borderWidth: 1,
                borderColor: '#e9e9e9'
            },
            emptyImageWrapper: {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#eaf7ff',
                image: {
                    width: getSize(140),
                    height: getSize(140)
                }
            },
            info: {
                flex: 1,
                paddingLeft: 20,
                header: {
                    ...commonStyles.flexRow,
                    title: {
                        flex: 1,
                        color: textDarkGray,
                        fontSize: commonFontSize,
                        fontWeight: '300',
                        marginRight: 5
                    },
                    price: {
                        color: textDarkGray,
                        fontSize: commonFontSize,
                        fontWeight: '300'
                    }
                },
                subtitle: {
                    color: '#aab7c5',
                    fontSize: getSize(28),
                    marginTop: getSize(7)
                }
            }
        }
    },
    totals: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        paddingVertical: getSize(39),
        ...separator,
        line : {
            ...commonStyles.flexRow,
            marginBottom: getSize(15),
            marginTop: getSize(15),
            name: {
                flex: 1,
                marginRight: 5,
                fontSize: commonFontSize,
                fontWeight: '300',
                color: textDarkGray
            },
            value: {
                fontSize: commonFontSize,
                fontWeight: '300',
                color: textDarkGray
            }
        }
    },
    totals2: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        ...commonStyles.flexRow,
        paddingVertical: getSize(50),
        ...separator,
        text: {
            fontSize: commonFontSize,
            fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
            fontWeight: Platform.OS !== 'ios' ? '600' : '500',
            color: '#162d3d'
        }
    },
    shipping: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        paddingTop: getSize(46),
        paddingBottom: getSize(48),
        ...separator,
        fullName: {
            marginBottom: getSize(30),
            fontSize: commonFontSize,
            fontWeight: '400',
            color: textDarkGray
        },
        address: {
            width: deviceWidth / 1.5,
            fontSize: commonFontSize,
            fontWeight: '300',
            lineHeight: getSize(52),
            color: textDarkGray
        },
        method: {
            fontSize: commonFontSize,
            fontWeight: '300',
            color: textDarkGray,
            marginBottom: getSize(48)
        },
        buyerNote: {
            marginTop: getSize(40),
            fontSize: commonFontSize,
            fontWeight: '300',
            lineHeight: getSize(52),
            color: textDarkGray
        },
        contacts: {
            ...commonStyles.flexRow,
            justifyContent: 'flex-start',
            marginTop: getSize(46),
            button: {
                ...commonStyles.flexRow,
                justifyContent: 'flex-start',
                marginRight: getSize(70)
            },
            ...(Platform.OS === 'ios' ? {
                engageImage: {
                    width: getSize(47),
                    height: getSize(48)
                },
                callImage: {
                    width: getSize(40),
                    height: getSize(40)
                }
            } : {
                engageImage: {
                    width: getSize(56),
                    height: getSize(56)
                },
                callImage: {
                    width: getSize(54),
                    height: getSize(54)
                }
            }),
            text: {
                fontSize: commonFontSize,
                fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
                fontWeight: Platform.OS === 'android' ? '600' : '400',
                color: '#00adf5',
                marginLeft: getSize(15)
            }
        }
    },
    history: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        marginTop: getSize(54),
        marginBottom: getSize(38),
        header: {
            ...commonStyles.flexRow,
            marginBottom: getSize(16),
            title: {
                fontSize: commonFontSize,
                fontWeight: '400',
                color: textDarkGray
            },
            button: {
                fontSize: commonFontSize,
                fontWeight: '400',
                color: blueColor
            }
        },
        item: {
            marginTop: getSize(40),
            message: {
                fontSize: commonFontSize,
                fontWeight: '300',
                color: textDarkGray,
                marginBottom: getSize(12)
            },
            time: {
                fontSize: commonFontSize,
                fontWeight: '300',
                color: '#7a92a5'
            },
            separator: {
                marginTop: getSize(40),
                borderBottomWidth: 0.5,
                borderBottomColor: 'rgb(228, 227, 230)'
            }
        }
    },
    separator: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#e4e3e6'
    },
    absolutePreloader: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgb(255, 255, 255)',
        opacity: 0.7,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
