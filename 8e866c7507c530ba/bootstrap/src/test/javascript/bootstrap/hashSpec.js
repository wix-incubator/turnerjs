/**
 * Created by IntelliJ IDEA.
 * User: Idoro
 * Date: 2/24/11
 * Time: 2:59 PM
 * To change this template use File | Settings | File Templates.
 */
describe('utils.hash', function() {

    var testTitle = 'my test title';
    var testId = 'myTestId';
    var extData = 'this/is/third|party/application|data';
    
    beforeEach(function() {
        window.location.hash = "";
    });

    afterEach(function() {
        window.location.hash = "";
    });

    it('hash object exists and valid', function() {
		expect(W.Utils).toBeDefined();
        expect(W.Utils.hash).toBeDefined();
	});

    it('hash.getHash should return hash with no #', function() {
        // Set new hash
        window.location.hash = 'getHashTest';
        // Check
        var utilHash = W.Utils.hash.getHash();
        expect(utilHash).toBe(window.location.hash.substr(1));
    });

    it('hash.setHash should change it (in the next code cycle)', function() {
        var tmpHash = "someHash";
        W.Viewer = {
            getHomePageId : function() {return "mainPage" }
        };

        // Check
        W.Utils.hash.setHash(tmpHash);
        waitsFor(function(){ return (W.Utils.hash.getHash() == tmpHash);}, 'hash to change', 10);
        runs(function(){
            expect(W.Utils.hash.getHash()).toBe(tmpHash);
        });
    });

    it('hash should dispatch event with new hash', function() {
        // Save reference
        var newHash = '_hashCheck'+Number.random(0,0xffffffff).toString(36);
        // Create hash change handler
        var hashChange = getAsyncExpects(function(event) {
            // Check new hash
            expect(event.newHash).toBe(newHash);
            // Clear
            W.Utils.hash.removeEvent('change', hashChange.callback);
        }.bind(this));
        runs(function(){
            // Listen to hash change
            W.Utils.hash.addEvent('change', hashChange.callback);
            // Change hash
            window.location.hash = newHash;
        });
        waitsFor(function(){
            return (W.Utils.hash.getHash() == newHash);
        }, "waiting for browser hash to change", 500);
        //Should be 100 ms due to an interval (according to Ido)
        waitsFor(hashChange.toHappen, 'hash change event', 150);
    });

    it('hash should dispatch event with new hash including title and extData', function() {
        W.Viewer = {
            getHomePageId : function() {return "mainPage" }
        };
        // Save reference
        var newHashId = '_hashCheck'+Number.random(0,0xffffffff).toString(36);
        var newTitle = '_titleCheck'+Number.random(0,0xffffffff).toString(36);
        var newExtData = '_whateverCheck'+Number.random(0,0xffffffff).toString(36);
        // Create hash change handler
        var hashChange = getAsyncExpects(function(event) {
            // Check new hash
            expect(event.newHash).toBe(newHashId);
            expect(event.extData).toBe(newExtData);
            // Clear
            W.Utils.hash.removeEvent('change', hashChange.callback);
        }.bind(this));
        runs(function(){
            // Listen to hash change
            W.Utils.hash.addEvent('change', hashChange.callback);
            // Change hash
            W.Utils.hash.setHash(newHashId, newTitle, newExtData);
        });
        waitsFor(function(){
            return (W.Utils.hash.getHash() == newHashId);
        }, "waiting for browser hash to change", 500);
        //Should be 100 ms due to an interval (according to Ido)
        waitsFor(hashChange.toHappen, 'hash change event', 150);
    });

    it('should extract test id (using pipeline delimiter)', function() {
        var hash = "#!" + testTitle + '|' + testId;
        var o = W.Utils.hash.getHashParts(hash);
		expect(o.id).toBeEquivalentTo(testId);
	});

    it('should extract test title  (using pipeline delimiter)', function() {
        var hash = "#!" + testTitle + '|' + testId;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.title).toBeEquivalentTo(testTitle);
	});

    it('should extract test id (using slash delimiter)', function() {
        var hash = "#!" + testTitle + '/' + testId;
        var o = W.Utils.hash.getHashParts(hash);
		expect(o.id).toBeEquivalentTo(testId);
	});

    it('should extract test title  (using slash delimiter)', function() {
        var hash = "#!" + testTitle + '/' + testId;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.title).toBeEquivalentTo(testTitle);
	});

    it('should extract third party application data (using slash delimiter)', function() {
        var hash = "#!" + testTitle + '/' + testId + '/' + extData ;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.extData).toBeEquivalentTo(extData);
	});

    it('should extract test title with extra slashes (using slash delimiter)', function() {
        var hash = "#!" + testTitle + '/' + testId + '/' + extData;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.id).toBeEquivalentTo(testId);
        expect(o.title).toBeEquivalentTo(testTitle);
        expect(o.extData).toBeEquivalentTo(extData);
	});

    it('should extract test title with extra slashes (using pipeline delimiter)', function() {
        var hash = "#!" + testTitle + '|' + testId + '/' + extData;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.id).toBeEquivalentTo(testId);
        expect(o.title).toBeEquivalentTo(testTitle);
        expect(o.extData).toBeEquivalentTo(extData);
	});

    it('should work with empty title (using slash delimiter)', function() {
        var hash = "#!" + '' + '/' + testId + '/' + extData;
        var o = W.Utils.hash.getHashParts(hash);
        expect(o.id).toBeEquivalentTo(testId);
        expect(o.title).toBeEquivalentTo('');
        expect(o.extData).toBeEquivalentTo(extData);
	});
});