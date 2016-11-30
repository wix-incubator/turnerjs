describe('EbayItemsBySeller', function() {
    beforeEach(function(){

        var dataItem = W.Data.createDataItem({
            type:'EbayItemsBySeller',
            sellerId:"testsellerid",
            registrationSite:"Sweden"
        });

        ComponentsTestUtil.buildComp(
            "wysiwyg.viewer.components.EbayItemsBySeller",
            "wysiwyg.viewer.skins.EbayItemsBySellerSkin",
            dataItem
        );
    });

    it('check that the URL for the ebay widget is correct', function() {
        var logic = this.compLogic;

        var options = {
            width: 570,
            height: 310,
            headerImage: '5',
            fontColor: '000001',
            borderColor: '000002',
            headerColor: '000003',
            backgroundColor: '000004',
            linkColor: '000005'
        };

        var options = logic._createUrl(logic._data.get('sellerId'), logic._data.get('registrationSite'), options);

        // checks that creating with right URL
        expect(options.url).toBe('http://lapi.ebay.com/ws/eBayISAPI.dll?EKServer&ai=aj%7Ckvpqvqlvxwkl&' +
            'bdrcolor=000002&fntcolor=000001&hdrcolor=000003&hdrimage=5&lnkcolor=000005&tbgcolor=000004&' +
            'si=testsellerid&sid=testsellerid&num=3&width=570&cid=0&eksize=1&encode=UTF-8&endcolor=FF0000&' +
            'endtime=y&fbgcolor=FFFFFF&fs=0&hdrsrch=n&img=y&logo=6&numbid=n&paypal=n&popup=y&prvd=9&r0=3&' +
            'shipcost=y&siteid=218&sort=MetaEndSort&sortby=endtime&sortdir=asc&srchdesc=n&title&' +
            'tlecolor=FFFFFF&tlefs=0&tlfcolor=000000&toolid=10004&track=5335838312');
    });
});
