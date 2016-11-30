/**
 * @class bootstrap.utils.StringUtils
 */
define.utils('StringUtils', function(){
    return {
        pad: function(n, width, z, right) {
            z = z || '0';
            n = n + '';
            if (n.length >= width) {
                return n;
            }

            var padding = new Array(width - n.length + 1).join(z);
            return right ? n + padding : padding + n;
        },

        printTable: function(lines) {
            var colLengths = {};
            lines.forEach(function(line) {
                line.forEach(function(col, colIndex) {
                    colLengths[colIndex] = Math.max(colLengths[colIndex] || 0, col.length);
                });
            });

            var pad = this.pad;
            var colIndex;
            return lines.map(function(cols) {
                colIndex = 0;
                return cols.map(function(col) {
                    return pad(col, colLengths[colIndex++], ' ', true);
                }).join(' ');
            }).join('\n');
        }
    };
});