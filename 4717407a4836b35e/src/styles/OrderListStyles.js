import {Dimensions} from 'react-native';
import stylesBuilder from '../utils/stylesBuilder';
import commonStyles from '../styles/CommonStyles';
import * as Patterns from '../utils/patterns';

function getSize(value) {
    return value/2;
}
let deviceWidth = Dimensions.get('window').width;

export default stylesBuilder({
    item: {
        ...commonStyles.flexRow,
        paddingRight: getSize(40),
        paddingLeft: getSize(40),
        paddingBottom: getSize(30),
        paddingTop: getSize(30),
        isNewStyles: Patterns.Bool({
            "true": '#eaf7ff',
            "false": '#fff'
        }, color => ({
            backgroundColor: color
        })),
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
            paddingLeft: getSize(30),
            header: {
                ...commonStyles.flexRow,
                title: Patterns.Bool({
                    "true": '600',
                    "false": '200'
                }, weight => ({
                    flex: 1,
                    color: '#2d4150',
                    fontSize: getSize(34),
                    marginRight: 5,
                    fontWeight: weight
                })),
                price: Patterns.Bool({
                    "true": '600',
                    "false": '200'
                }, weight => ({
                    color: '#2d4150',
                    fontSize: getSize(34),
                    fontWeight: weight
                }))
            },
            subtitle: {
                ...commonStyles.flexRow,
                marginTop: getSize(10),
                info: Patterns.Bool({
                    "true": '#7a92a5',
                    "false": '#aab7c5'
                }, color => ({
                    flex: 1,
                    color: color,
                    fontSize: getSize(deviceWidth < 375 ? 26 : 28),
                    fontWeight: '400',
                    marginRight: 5
                })),
                status: Patterns.Bool({
                    "true": '#60bc57',
                    "false": '#ee5951'
                }, (x) => ({
                    color: x,
                    fontSize: getSize(deviceWidth < 375 ? 26 : 28),
                    fontWeight: '400'
                }))
            }
        }
    }
});