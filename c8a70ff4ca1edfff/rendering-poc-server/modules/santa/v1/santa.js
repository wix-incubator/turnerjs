const ver = "1.0";

console.log("loaded version:" + ver);

exports.version = function () {
  return ver;
};