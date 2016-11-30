const ver = "2.0";

console.log("loaded version:" + ver);

exports.version = function () {
  return ver;
};