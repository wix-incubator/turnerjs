define(['lodash', 'coreUtils/core/textPatternRecognizer'], function (_, textPatternRecognizer) {
    'use strict';

    var allPatterns = {
        'PHONE': true,
        'MAIL': true,
        'URL': true
    };

    function createItem(text, key, value, pattern) {
        return {
            key: key,
            value: value,
            index: text.indexOf(key),
            pattern: pattern
        };
    }

    describe('textPatternRecognizer', function () {
        describe('findAll', function () {

            it('should return empty array for falsy input', function () {
                expect(textPatternRecognizer.findAll("", allPatterns)).toEqual([]);
                expect(textPatternRecognizer.findAll()).toEqual([]);
                expect(textPatternRecognizer.findAll(null, allPatterns)).toEqual([]);
            });

            it('should parse phone numbers which contain digits, dots, dashes, spaces, parenthesis, and leading plus sign', function () {
                var testString = "ut (972) 54-111-2222 ultricies nunc(0044) - 2074990888.aliquamin+1 (862)371-9650 sollicitudin lacus";
                var expectedResults = [
                    createItem(testString, "(972) 54-111-2222", "972541112222", textPatternRecognizer.Pattern.PHONE),
                    createItem(testString, "(0044) - 2074990888", "00442074990888", textPatternRecognizer.Pattern.PHONE),
                    createItem(testString, "+1 (862)371-9650", "18623719650", textPatternRecognizer.Pattern.PHONE)
                ];
                expect(textPatternRecognizer.findAll(testString, {'PHONE' : true})).toEqual(expectedResults);
            });

            it('should parse emails when they are separate by spaces, tabs, colons, semi-colon or comma', function () {
                var testString = "ut jizant.hapus@wix.com ultricies nunc:under@pants.gnomes;aliquamin,scott-tenorman@must.die sollicitudin lacus";
                var expectedResults = [
                    createItem(testString, "jizant.hapus@wix.com", "jizant.hapus@wix.com", textPatternRecognizer.Pattern.MAIL),
                    createItem(testString, "under@pants.gnomes", "under@pants.gnomes", textPatternRecognizer.Pattern.MAIL),
                    createItem(testString, "scott-tenorman@must.die", "scott-tenorman@must.die", textPatternRecognizer.Pattern.MAIL)
                ];
                expect(textPatternRecognizer.findAll(testString, {'MAIL' : true})).toEqual(expectedResults);
            });

            it('should parse urls when they are separate by spaces, tabs, colons, semi-colon or comma', function () {
                var testString = "ut http://foo.com/blah_blah_(wikipedia) ultricies nunc:http://www.example.com/wpstyle/?p=364 aliquamin,http://foo.bar/?q=Test%20URL-encoded%20stuff sollicitudin lacus";
                var expectedResults = [
                    createItem(testString, "http://foo.com/blah_blah_(wikipedia)", "http://foo.com/blah_blah_(wikipedia)", textPatternRecognizer.Pattern.URL),
                    createItem(testString, "http://www.example.com/wpstyle/?p=364", "http://www.example.com/wpstyle/?p=364", textPatternRecognizer.Pattern.URL),
                    createItem(testString, "http://foo.bar/?q=Test%20URL-encoded%20stuff", "http://foo.bar/?q=Test%20URL-encoded%20stuff", textPatternRecognizer.Pattern.URL)
                ];
                expect(textPatternRecognizer.findAll(testString, {'URL' : true})).toEqual(expectedResults);
            });

            it('should resolve collisions', function () {
                var testString = "ut (972) 54-111-2222 ultricies nunc:under@pants.gnomes aliquamin,http://foo.bar/?q=Test%9720542204715stuff sollicitudin lacus";
                var expectedResults = [
                    createItem(testString, "(972) 54-111-2222", "972541112222", textPatternRecognizer.Pattern.PHONE),
                    createItem(testString, "under@pants.gnomes", "under@pants.gnomes", textPatternRecognizer.Pattern.MAIL),
                    createItem(testString, "http://foo.bar/?q=Test%9720542204715stuff", "http://foo.bar/?q=Test%9720542204715stuff", textPatternRecognizer.Pattern.URL)
                ];
                expect(textPatternRecognizer.findAll(testString, {'PHONE': true, 'MAIL': true, 'URL': true})).toEqual(expectedResults);
            });

            it('should recognize all the following urls:', function () {
                var urls = [
                    'https://www.evillasforsale.com', 'https://www.xenith.net', 'http://www.electrichumanproject.com/', 'http://tweekerchick.blogspot.com/', 'https://www.lepoint.fr/', 'https://www.openbsd.org/cgi-bin/man.cgi',
                    'https://www.brunching.com/toys/toy-alanislyrics.html', 'https://www.xsorbit1.com/users/JediMindTrick/index.cgi', 'http://www.entropy8zuper.org/', 'http://www.agr-s.com/', 'http://www.shethinks.org/articles/an00021.cfm',
                    'https://israblog.nana10.co.il/blogread.asp?blog=31900', 'http://casal.upc.es/~dani28/', 'https://soemz.euv-frankfurt-o.de', 'http://star_girl.blogspot.com', 'http://www.public-i.org/dtaweb/list.asp?L1=10&L2=0&L3=0&L4=0&L5=0',
                    'http://www.zdnet.com/zdhelp/filters/quickstart/guides/0,10606,6001653,00.html', 'https://search.npr.org/cf/cmn/cmnpd01r.cfm?PrgCode=ATC', 'https://www.fabric8.com/bazaar/product.f8ml?PID=SN0107',
                    'http://www.penny-arcade.com/view.php3?date=2001-09-05&res=l', 'http://www.creators.com/opinion_show.cfm?columnsName=aco', 'https://www.faqs.org/faqs/cultures/irish-faq/part08/section-10.html',
                    'http://www.cl.cam.ac.uk/~rja14/tcpa-faq.html', 'http://www.guardian.co.uk/Columnists/Archive/0,5673,-286,00.html', 'https://www.washingtonpost.com/wp-dyn/metro/columns/milloycourtland/index.html',
                    'http://www.penny-arcade.com/view.php3?date=2001-03-16&res=l', 'https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://www.example.com/wpstyle/?p=364', 'https://foo.com/blah_blah_(wikipedia)_(again)', 'http://foo.bar/?q=Test%20URL-encoded%20stuff',
                    'https://foo.com/blah_(wikipedia)_blah#cite-1', 'http://223.255.255.254', 'https://a.b-c.de', 'http://j.mp',
                    "https://X5.zloqxoa\\3pl7/Lz3.4&%0", "http://KpZnqvvj1LopYuvnG/}", "http://Zb8R0zT7TDEFb", "http://wu6QraOQm/]Oi", "https://AFqtjT7P8", "http://6n%sG\\y0Iw4jXzqthZu%KuK1+x:bRhu6",
                    "http://gk|ijbj8i&&Ruz((t=uQ3o", "www.UnfJxYHLU", "http://vHOq/Q9.NPt", "www.KCraY3i4C", "https://LFmZ/sJ&zDYsrYn", "www.kE/saBGX4G^%M5Cq?k4lDvZ%lEkpG=?Y",
                    "http://EL5E3%NsNmQVjzMA", "www.6uh07jzK4t\"F9nDP8RM5&94NZ=Q/?43hZa0", "www.HW2hjdeWvao", "www.tsD.3m/la(Vq&I=ZGxrf6c&fNZLEqVu?UMKbhI<", "http://y3ay64J%x%b/9,6~",
                    "www.Hq9/9WTcOw$", "www.2Cq2zaRrL4qnw97/m6X3p7qnkCjUY=dT/x!XO", "www.3rolpXk0RAyhrz.u%IYScx0cDvru%7", "http://u3HBs4\"4.rI%n3w./8cM3QFE0&phUrchKdO.BiI", "www.Wtmd/!B04c?eP?=pdpS7NEJJNL",
                    "http://u.hqA/oKpr=P0:", "http://8/AgTnz&ckM84G4pIryZPyTqGPZ", "https://DrIkvQUOkBQM}", "https://WExDIh1m0gC|yf;?fWPJuN&gwK%0\"SJLi!/Z^", "www.2Cq2zaRrL4qnw97/m6X3p7qnkCjUY=dT/x!XO",
                    'http://www.altpress.org/', 'http://www.nzfortress.co.nz', "www.3rolpXk0RAyhrz.u%IYScx0cDvru>%7"
                ];

                var unrecognizedUrls = _(urls)
                    .reject(function(url){
                        return textPatternRecognizer.findAll(url, {'URL' : true}).length === 1;
                    })
                    .reduce(function(res, url){
                        return res + ((res === '' ? url : "\n" + url));
                    }, '');

                if (unrecognizedUrls) {
                    expect(unrecognizedUrls).toBeValidUrl('');
                }
            });

            it('should not recognize any of the following urls:', function () {
                var urls = ["http://\'dJRBb&eM%WseA7p/l.e.V&r#OYDC%", "https://ibSPWCJWx0#hxC=wE2jia", "http://XoIL(6<`;BD[JEW5&C&=VLI&gR", "http://NeoOy(924r?H,gzu0/weXDh6m.\"nu?z/", "http://[Xn93zgOi$",
                    "www.=Xpc6PEVl15i93QriPFbQN0/kZq", "https://8TPW&Bw?APuikU3QZV7rKHj\'M9@D", "www.EvjxTIY&2rFR-Q", "http://Z?9YYNN,uJJX7", "http://EQJlGisM=2Gv0/A=8/m3Oo4IpguC5jOcQDiJo", "http://8+?*BH=l>gIG4Qc%`%=dlWX*x{U|MV8D.&g?J",
                    "https://rpD0WDcfj0SNin@uxRgg59SiKg5Mh&4QdXx", "https://E.0\'/FLDY?2x?bI/WcSv4.", "www.brJ0MeyOn9?F/K%MgvbZ@hzU", "https://&&YxOyhTh&y3.YO", "www.WfY.Nh0VSzLB&T48qkZ%fmL?MC9gjj//+D8g5$",
                    "https://Nqi%inVbk8)%KEq0fa.G7uowVogCBWYB.fgI", "https://XWLtdFR=byxVQ/aM2r%", "http://b$c8J.Keuj5E.SfZt79?MF0Ge2/as}s", "http://sDytVDF=f&2/=hcbjdG%}m%%{nUx/H@xB2o",
                    "https://mSqEH9?A|e", "www.+raEavr.ebIO%Hj1HMd7QBdN", "http://=SRNil/yG4Ms0eHo5kSNd8dK5eUd1=Xv&DT&?ZVL", "www.4dkww.Qz1B=qeHB4veL?24Wx?&39uDb?e",
                    "www.PRfd&skS^aGXs=X0SgH", "https://7XPXj?/6/.hfxIZ%?&=$_fdC57A//Q!GlcTmP", "http://El?Ew#pxrCZ/ass}&q{o)m?4CR?/gDNtey69DY",
                    "www.Em&1W=q%m8f4fKHCg7XQrQ5e8Pk\\Q", "http://xa%XLGVo0=jqY0", "https://l=XY8E8ijLUMx.L%TdAl.o8G1aE5V=", "www.XqXEp8Ofa&wdN?iP41",
                    "https://M9fp#&KVR?JIePE%d44.monWMJbl", "https://TlOUhP9&b|1Cz4&Gp/w3w%", "www.Z%pdIEERaRB&hEX@&7pz?.Z5Xq0kPDiG%!", "https://&XcNXW3OuM2LwiIV+WU2R@xWgjEJ.KVb%",
                    "https://a6XTs1C71=oYEXZK??&", "https://z&HE3\'N=3HLSl?&NThhKqHAw5?G", "https://ZBoT=&j$50eOz8jMik=m0nbA5.Hc<OfrpXQvx4f", "www.BP%[K0a&k&p/2?NXVAB.o=XGmwnGWC", "www./NVOc6w7p2", "www.?vbX<MgtBc4FC2u2CMCA<", "www./|T?N&86%hi&hdrR2wAL.xk&o6Ykj9L",
                    "www.%SA].DxxPVgh?URq&&_", "http://37ltNHB+6DF0X5eqSEid/", "https://cDWe9IOBwvS?NbYgBJM", "www.2m=/0he.XU", "http://TPWy24%dfvAJ1?KyTxCWd2O1OEBj|asgm[", "https:///lTEzRNY3?UIGH", "www.dzGg7Gw?k*", "http://EkPHa%.Cj?A^U3",
                    "https://nM0P3Ec2RCO?Kn?DgDRWEPzC", "www.6X?2I5poJuBXv5jx(AWjbPxgM|C.4H/w0z", "http://N&XITFVJwq-", "https://+/41f95%El", "https://mvMbuZ.?m%M", "www.x?ypwN7&XrPR0GQCfa/DxZ.i0f%)HR",
                    "http://ln2P46pHARkF[7", "www.1CDG;jC.%R1XW", "http:///UiPCQADcgAQn2PbIlF6ykX/ak_&Vw8*d8Y", "https://4vqN8IO=mN.^wZ%ex6qeVG.V8k&ZlEca~.dPQ",
                    "https://mUJ&sme&VibYXMWpr7aAR1yw", "https://MvwFnSte@ZGDuDWxWq7ZzUxd1gAvy&s;", "http://z2EQ.nsH9nV1F=uUe=&Ic", "https://Z%3RWg=p)z8",
                    "http://6lj-=J9Oc%kn?oAf/ok?k3uOtPhM3K1CIU/nROR", "https://z=sIHqVnq%&&qNQYGI7ps2q.h@GOt8daxWk8Xkj", "https://RKpHPJK=VA1xy&gBu5MCaI7uC&>S4Wgk", "www.T2;rqhXo8.H1VFL4sHuCuHu$wS&C^GH7UdotT", "https://lUvN0dUtHx6vM.Hu%N%TpNjQ0=.>laHxa",
                    "http://P?Xwx.9fk/I={9", "https://i7(zp?ZeFM2ZonZq%m4UhzcNF4lz9I5", "https://=CnA7`EkK=aP"];

                var recognizedUrls = _(urls)
                    .filter(function(url){
                        return textPatternRecognizer.findAll(url, {'URL' : true}).length === 1;
                    })
                    .reduce(function(res, url){
                        return res + ((res === '' ? url : "\n" + url));
                    }, '');

                if (recognizedUrls) {
                    expect(recognizedUrls).toBeValidUrl('(not)');
                }
            });
        });
    });
});
