import {Dimensions, Platform} from 'react-native';

import * as Patterns from '../utils/patterns';

const {height, width} = Dimensions.get('window');

let style = {
    mainView: {
        flex: 1
    },
    segmentView: {
        borderBottomWidth: 1,
        borderBottomColor: '#e3e3e5',
        paddingHorizontal: 20,
        paddingVertical: 9,
        justifyContent: 'center',
        alignItems: 'center'
    },
    segment: {
        width: 250
    },
    hbox: {
        flexDirection: 'row'
    },
    vbox: {
        flexDirection: 'column'
    },
    listItemSelector: {
        position: 'absolute'
    },
    listItem: {
        paddingTop: 20,
        paddingBottom: 20,
        width: (width/2 - 20),
        height: 250,
        backgroundColor: '#FFF',
        borderColor: '#e8e9ec',
        borderBottomWidth: 1
    },
    listItemImage: {
        width: (width/2 - 30),
        height: 159,
        //width: 50,
        //height: 50,
        borderRadius: 1,
        //marginLeft: 15,
        //marginRight: 15
    },
    sep: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#e8e9ec'
    },
    textSection: {
        marginLeft: 15,
        paddingTop: 5
    },
    textTag: {
        fontSize: 14,
        fontWeight: '200',
        color: '#60bc57'
    },
    inStockView: {
        backgroundColor: "#7a92a5",
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inStock: {
        fontSize: 14,
        color: '#aab7c5'
    },
    outOfStock: {
        color: "#ee5951",
        fontSize: 14
    },
    inventoryStatus: Patterns.Bool({
        in_stock: '#aab7c5',
        partially_out_of_stock: '#fb7d33',
        out_of_stock: '#ee5951'
    }, color => ({
        fontSize: 14,
        color
    })),
    old: {
        textDecorationLine: 'line-through',
        color: '#a7b2bb'
    },
    arrow: {
        width: 8,
        height: 13
    },
    searchBar: {
        padding: 10,
        backgroundColor: '#e3e3e5',
        flex: 1
    },
    searchBarInput: {
        height: 30,
        padding: 5,
        backgroundColor: '#ffffff',
        borderRadius: 3
    },
    stickyHeader: {
        width: width,
        //backgroundColor: '#f4f4f4',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderBottomColor: '#e8e9ec',
        borderBottomWidth: 1,
        //height: 37
        //marginBottom: 20
    },
    stickyHeaderText: {
        color: '#8197a9',
        fontSize: 14,
        fontWeight: '400'
    },
    footerBar: {
        borderTopWidth: 1,
        borderTopColor: '#b2b2b2',
        paddingHorizontal: 17,
        paddingVertical: 12,
        backgroundColor: '#f8f8f8',
        height: 45
    },
    footerBarText: {
        color: '#00adf5',
        fontSize: 17
    },
    selectedRow: {
        backgroundColor: '#f6faff'
    },
    noApp: {
        backgroundColor: '#eaf7ff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    noAppText: {
        fontSize: 20,
        color: '#00adf5'
    },
    emptyList: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    emptyListHeader: {
        fontSize: 23,
        fontWeight: '200',
        marginTop: 27,
        marginBottom: 8,
        color: '#2d4150',
        textAlign: 'center'
    },
    emptyListSubHeader: {
        color: '#7a92a5',
        fontSize: 17,
        lineHeight: 25,
        fontWeight: '200',
        textAlign: 'center'
    },
    emptyListCTA: {
        color: '#00adf5',
        fontSize: 17,
        lineHeight: 25,
        fontWeight: '200',
        textAlign: 'center'
    },
    absolutePreloader: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rightButtons: {
        alignItems: 'flex-end'
    },
    toolBarStyle: {
        top: 44,
        width: width,
        position: 'absolute',
        borderTopWidth: 0,
        height: 66,
        backgroundColor: 'transparent'
    
    },
    segmentedControl: {
        marginBottom: 8,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 0
    },
    lineBorder: {
        height:2,
        backgroundColor:'#e8e9ec'
    },
    labelItemView: {
        // flex: 1,
        // flexDirection: 'column',
        // alignItems: 'center',
        marginTop: 2
    },
    discount: {
        position: 'absolute',
        height: 20,
        backgroundColor: '#2b5672',
        top: 10,
        paddingHorizontal: 10,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
    },
    invisibleIcon: {
        position: 'absolute',
        top: 30,
        right: 10,
        width: 16.5,
        height: 15.5
    },
    noResult: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 66 : 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#fff'
    },
    noResultText: {
        color: '#7a92a5',
        fontSize: 17,
        fontWeight: '200',
    }
};

let listItemContentWidth = width - style.listItem.paddingRight
    - style.listItem.paddingLeft
    - style.listItemImage.width
    - 2 * style.textSection.marginLeft;

export default {
    ...style,
    textName: {
        fontSize: 17,
        fontWeight: '200',
        color: '#162d3d',
        width: (width/2 - 30)
    },
    labelsView: {
        width: listItemContentWidth,
        flexGrow: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
};
