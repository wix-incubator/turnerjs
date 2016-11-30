'use strict'
const fs = require('fs')

const fileUtil = {
    getFileContents: fileName => fs.readFileSync(fileName, 'utf8'),
    saveFile: (fileName, data) => {
        fs.writeFileSync(fileName, data)
    }
}

module.exports = fileUtil
