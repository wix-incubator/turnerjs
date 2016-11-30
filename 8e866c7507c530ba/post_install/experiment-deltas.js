//the two command line parameters are strings in the format of "experimet=<exp_name>:<new?>&exp..."
//(note that they need to be in quotes!)
var older=process.argv[2];
var newer=process.argv[3];

function getExpList(expString) {
   return expString.split("&").map(function(k) { return /experiment=([^:]+):(.+)$/g.exec(k)[1]; });
}
function isContain(arr, k) { return arr.filter(function(key) { return key===k; }).length > 0; }
function compareToExpList(oldL, newL) {
   var o = getExpList(oldL);
   return getExpList(newL).filter(function(key) { return !isContain(o, key); });
}
console.log('added experiments: ' + compareToExpList(older,newer).join(','));
console.log('removed experiments: ' + compareToExpList(newer,older).join(','));
