


define.resource('fnvHash', function () {
    "use strict";

    /**
     * FNV1a 32bit hashing with optional reduction to 16-32 bits
     * FNV is a simple and fast NON-CYPTO hashing algorithms family.
     * @param {String} str a string to digest
     * @param {Integer=20} reduceToXBits a number of bytes the hash will be reduced to. must be between 16 to 32
     * @return {String} a 1-7 characters digest of str in base 36. (the safety to length minimax is max 4 characters for 20 bit reduction)
     */var fnvHash = function (str, reduceToXBits) {
        var FNV_PRIME = 0x01000193,
            FNV_BASE_OFFSET = 0x811C9DC5,
            i,
            l = str.length,
            hash = FNV_BASE_OFFSET;


        // FNV1a implementation
        for (i = 0; i < l; i++) {
            var charCode = str.charCodeAt(i) & 0xff;
            hash = (hash ^ charCode) * FNV_PRIME;
        }

        return fnvHash.reduceHash(hash, reduceToXBits).toString(36);
    };

    /**
     * 32 bit hash reduction to 16-32 bits
     * @param {Integer} hash
     * @param {Integer=20} reduceToXBits
     * @return {Integer} a <i>reduceToXBits</i> reduction of <i>hash</i>
     */
    fnvHash.reduceHash = function (hash, reduceToXBits) {
        reduceToXBits = reduceToXBits || 20;
        if (reduceToXBits < 16 || reduceToXBits > 32) {
            throw new Error('Invalid reduceToXBits value: must be in the 16-32 range');
        }
        if (reduceToXBits === 32) {
            return hash;
        }

        // xor folding to reduce the hash size to 20bit
        var shift = 32 - reduceToXBits;
        var mask = (1 << shift) - 1;
        var rightBits = hash & mask;
        var leftBits = hash >>> shift;

        return (rightBits ^ leftBits);
    };

    return {
        hash:function (str, numBits) {
            return fnvHash(str, numBits || 28);
        }
    };

}());

