Object.isEquivalent = function(obj1, obj2) {
    // check types

    // quit comparison if types don't match
    if (typeof obj1 !== typeof obj2) {
        return false;
    }

    // quit comparison of one object is an array and the other is not
    if (obj1 instanceof Array && !(obj2 instanceof Array)) {
        return false;
    }

//    // if both objects are functions, return true (see test for functions in utilsSpec)
//    if ((typeof obj1 && typeof obj2) == 'function') {
//        return true;
//    }

    // compare and return for simple types
    if (typeof obj1 === 'string' || typeof obj1 === 'number' || typeof obj1 === 'boolean' || typeof obj2 === 'function') {
        return (obj1 === obj2);
    }

    // init key counter
    var numberOfKeys = 0;

    // check if object is an array
    var isArray = (obj1 instanceof Array);

    // if object is not an array use key/value
    if (!isArray) {
        // go over the keys in obj1 and count them, return false if comparison to obj2 fails
        for (var key in obj1) {
            if (obj1.hasOwnProperty(key) && !obj2.hasOwnProperty(key)) {
                return false;
            } else {
                ++numberOfKeys;
            }
        }

        // validate both objects has same number of properties by decreasing count to zero
        for (key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                numberOfKeys--;
            }
        }

        // return false if count doesn't match
        if (numberOfKeys !== 0) {
            return false;
        }

        // check equivalency of values
        for (key in obj1) {
            if (obj1.hasOwnProperty(key) && !Object.isEquivalent(obj1[key], obj2[key])) {
                return false;
            }
        }
    } else {
        // if object is an array, assume keys are numbers and use helper to recursively compare values
        var helper = function(item, index) {
            return Object.isEquivalent(item, obj2[index]);
        };

        return (obj1.length == obj2.length && obj1.every(helper, obj2) );
    }

    return true;
};
