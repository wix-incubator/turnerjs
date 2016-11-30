import {Dimensions, PixelRatio, Platform} from 'react-native';
import { transformStyles } from '../utils/stylesBuilder';
import stylesBuilder from '../utils/stylesBuilder';
import commonStyles from './CommonStyles';

let deviceWidth = Dimensions.get('window').width;

function getSize(value) {
    return value/2;//PixelRatio.get();
}

let horisontalPaddings = {
    paddingRight: getSize(50),
    paddingLeft: getSize(50)
};

export default stylesBuilder({
    wrapper: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    scrollView: {
        ...(Platform.OS === 'ios' ? horisontalPaddings : {}),
        flex: 1,
        flexDirection: 'column'
    },
    summary: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        marginTop: getSize(68),
        marginBottom: getSize(42),
        total: {
            fontSize: getSize(54),
            fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
            fontWeight: '300',
            color: '#2d4150',
            marginBottom: getSize(12)
        },
        date: {
            fontSize: getSize(34),
            fontWeight: '300',
            color: '#2d4150'
        }
    },
    status: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        paddingTop: getSize(50),
        paddingBottom: getSize(50),
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
        lineWrapper: {
            ...commonStyles.flexRow
        },
        paymentMargin: {
            ...(deviceWidth > 350 ? {} : {marginBottom: getSize(8)})
        },
        text: {
            fontWeight: '400',
            fontSize: getSize(34)
        },
        green: {
            color: '#60bc57'
        },
        red: {
            color: '#f63026'
        }
    },
    items: {
        marginTop: getSize(43),
        marginBottom: getSize(43),
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
                        color: '#2d4150',
                        fontSize: getSize(34),
                        fontWeight: '300',
                        marginRight: 5
                    },
                    price: {
                        color: '#2d4150',
                        fontSize: getSize(34),
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
        marginTop: getSize(39),
        marginBottom: getSize(39),
        line : {
            ...commonStyles.flexRow,
            marginBottom: getSize(15),
            marginTop: getSize(15),
            name: {
                flex: 1,
                marginRight: 5,
                fontSize: getSize(34),
                fontWeight: '300',
                color: '#2d4150'
            },
            value: {
                fontSize: getSize(34),
                fontWeight: '300',
                color: '#2d4150'
            }
        }
    },
    totals2: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        ...commonStyles.flexRow,
        paddingTop: getSize(50),
        paddingBottom: getSize(50),
        text: {
            fontSize: getSize(34),
            fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
            fontWeight: Platform.OS !== 'ios' ? '600' : '500',
            color: '#162d3d'
        }
    },
    shipping: {
        ...(Platform.OS !== 'ios' ? horisontalPaddings : {}),
        marginTop: getSize(46),
        marginBottom: getSize(48),
        fullName: {
            marginBottom: getSize(30),
            fontSize: getSize(34),
            fontWeight: '400',
            color: '#2d4150'
        },
        address: {
            width: deviceWidth / 1.5,
            fontSize: getSize(34),
            fontWeight: '300',
            lineHeight: getSize(52),
            color: '#2d4150'
        },
        method: {
            fontSize: getSize(34),
            fontWeight: '300',
            color: '#2d4150',
            marginBottom: getSize(48)
        },
        buyerNote: {
            marginTop: getSize(40),
            fontSize: getSize(34),
            fontWeight: '300',
            lineHeight: getSize(52),
            color: '#2d4150'
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
                fontSize: getSize(34),
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
                fontSize: getSize(34),
                fontWeight: '400',
                color: '#2d4150'
            },
            button: {
                fontSize: getSize(34),
                fontWeight: '400',
                color: '#00adf5'
            }
        },
        item: {
            marginTop: getSize(40),
            message: {
                fontSize: getSize(34),
                fontWeight: '300',
                color: '#2d4150',
                marginBottom: getSize(12)
            },
            time: {
                fontSize: getSize(34),
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
        borderBottomColor: 'rgb(228, 227, 230)'
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
