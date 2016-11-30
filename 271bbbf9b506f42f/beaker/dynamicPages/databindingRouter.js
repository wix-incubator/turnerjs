///**
// http://wix.com/jobs/locations/tel-aviv/positions/1
// innerRoute = /locations/tel-aviv/positions/1
// routerConfig = {
//  urlPatterns: [
//    {
//      pattern,
//      page,
//      collection,
//      subPatternsFilters: {
//        [{
//          <field name used in the main pattern>: <pridicate on the field value>
//        }, {...}],
//        subPatternsFilters: {
//          [{
//            <field name used in the main pattern>: <pridicate on the field value>
//          }, {...}],
//          subPatternsFilters: {...}
//        }
//      }
//    },
//    {
//      pattern: '/locations/{{city}}/positions/{{ID}}',
//      page: 'c1dmp',
//      colleciton: 'postions',
//      subPatternsFilters: {
//        [{
//          city: '= tel-aviv'
//        }],
//        page: 'tlvPosPage'
//        subPatternsFilters: {
//          [{
//            ID: 'startWith('manange_')'
//          }],
//          page: 'israel_management_positions'
//        }
//      }
//    },
//    {
//      pattern: '/positions/{{ID}}/apply',
//      page: 'c1dmp',
//      colleciton: 'postions'
//    }
//  ],
//  extraFilterOptions - sort\count\filter by field
//}
// */
//
//
///**
// return fieldValues = {
//    <filed name>: <field value from url>
//  }
// */
//function matchRouteUrlPattern(innerRoute, urlPatterns) {
//    forEach(urlPatterns, (urlPattern) => {
//        var regEx = convertToRegEx(urlPattern.pattern);
//    if (regEx match innerRoute) {
//        return {
//            page: urlPattern.page,
//            collection: urlPattern.collection,
//            fields: {
//                '<filed name>': '<field value from url>' //using the regEx group
//            }
//        }
//    }
//})
//}
//
//function route(innerRoute, routerConfig) {
//    var matched = matchRouteUrlPattern(innerRoute, routerConfig.urlPatterns)
//    if (!matched) {
//        return 404;
//    }
//
//    var getDataFromDB = selectFrom(matched.collection).where(matched.fields).and.where(routerConfig.extraFilterOptions);
//
//    return {
//        matched.page,
//        data: getDataFromDB
//};
//}
