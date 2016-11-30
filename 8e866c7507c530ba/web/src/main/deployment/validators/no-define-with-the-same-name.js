module.exports = function noDefineWithTheSameName(data, anylint){

    var defineKeywords = [
        'deployment',
        'bootstrapClass',
        'experiment',
        'experimentPlugin',
        'resource',
        'activity',
        'class',
        'utils',

        'Class',
        'newClass',

        'Const',
        'newConst',

        'component',
        'newComponent',

        'skin',
        'newSkin',

        'dataItem',
        'newDataItem',

        'dataThemeItem',
        'newDataThemeItem',

        'dataPropertyItem',
        'newDataPropertyItem',

        'dataSchema',
        'newDataSchema'
    ];

    var errors = [];
    var listOfExpressions = data.map(function(dataNode){
        return {
            filePath: dataNode.filePath,
            expressions: anylint.datagrabbers.top_level_ast(
                dataNode.ast,
                anylint.filters.class_definition,
                anylint.extractors.class_definition
            )
        };
    });

    defineKeywords.forEach(validateByKeyWord);

    function validateByKeyWord (keyWord){
        var allDefinitionsByFile = {};
        listOfExpressions.forEach(
            function(token){
                var filePath = token.filePath;

                token.expressions
                    .filter(function(exp){
                        return exp.name === keyWord;
                    })
                    .forEach(function(expression) {
                        var arg = expression.argument;
                        if (allDefinitionsByFile[arg]) {
                            errors.push(arg + ' - defined both in ' +
                                allDefinitionsByFile[arg] + ' and ' + filePath);
                        } else {
                            allDefinitionsByFile[arg] = filePath;
                        }
                    });
            }
        );
    }

    return errors;
};
