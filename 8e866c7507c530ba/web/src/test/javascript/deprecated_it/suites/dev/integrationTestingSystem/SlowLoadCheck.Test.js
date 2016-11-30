//testRequire().classes('wysiwyg.deployment.JasmineViewerHelper');

var time;
var flag;
var n = -1;

function isPrime(n) {
    if (isNaN(n) || !isFinite(n) || n%1 || n<2) {
        return false;
    }
    var sqrtn = Math.sqrt(n);
    for (var i=2; i<=sqrtn; i++) {
        if (n%i == 0) {
            return false;
        }
    }
    return true;
}

describe("Every test id:", function () {
    beforeEach(function() {
//        window.viewer = window.viewer || new this.JasmineViewerHelper();
        n += 1;
        time = Math.pow(Math.random(),2) * 1000;
        flag = false;
        setTimeout(function(){ flag = true; }, time);
        waitsFor(function(){return flag;}, "waiting", time * 1.2);
    });

    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
    it("should be prime", function() {
        runs(function(){ expect(isPrime(n)).toBeTruthy(); });
    });
});