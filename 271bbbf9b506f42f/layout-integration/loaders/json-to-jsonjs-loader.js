/*eslint strict:["error", "global"]*/
'use strict';

const fs = require('fs');
const readFile = (done) => {
    return (err, fileName)=>{
        fs.readFile(fileName, 'utf8', done);
    };
};

module.exports = function(/*source*/){
    this.cacheable();
    this.resolve(this.context, this.resource + '.js', readFile(this.async()));
};
