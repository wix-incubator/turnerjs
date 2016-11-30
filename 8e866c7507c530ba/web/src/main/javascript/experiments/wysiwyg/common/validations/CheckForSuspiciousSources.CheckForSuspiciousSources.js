/**
 * Created by Dima_Ryskin on 7/15/14.
 * This script runs, independently, over the DOM to see if there are any script/img/link tags with suspicious sources (using a white-list)
 * For now, it'll create a 10 second timeout in any case, but it will abort the check if the experiment 'CheckForSuspiciousSources' is not set to 'new'
 * adding URL parameter CheckForSuspiciousSources=false/true will override any experiment setting here
 */
(function() {
    'use strict';

    /**
     * Valid sources regexes, to verify the sources of elements.
     * @type {{img: string[], script: string[], link: string[]}}
     */
    var validSourcesByTag = {
        img: ['^$','^http:..[^.]+\.(wixstatic|wix|parastorage)\.com', '^data:', '^http:..localhost\/'],
        script: ['^http:..[^.]+\.(wixstatic|wix|parastorage|newrelic)\.com',
            '^$',
            '^https:..apis\.google\.com\/',
            '^http:..www\.googletagmanager\.com\/',
            '^http:..www\.googleadservices\.com\/', //Possibly added by extensions
            '^https?:..ajax\.googleapis\.com\/',
            '^http:..fast\.fonts\.net\/',
            '^http:..stats.g.doubleclick.net\/dc.js$',
            '^http:..connect\.facebook\.net\/',
            '^http:..www\.paypalobjects\.com\/',
            '^http:..www\.google-analytics\.com',
            '^https:..dl\.dropbox\.com\/u\/32444059\/iWixFF\/',
            '^http:..localhost\/',
            '^http:..bam.nr-data.net\/',
            '^http:..ad.doubleclick.net\/'
        ],
        link: ['^\/\/fonts.googleapis.com',
            '^http:..fonts\.googleapis\.com',
            '^http:..fast\.fonts\.net\/',
            '^http:..[^.]+\.(wixstatic|wix|parastorage)\.com',
            '^http:..localhost\/'
        ]
    };

    function executeValidator() {
        try {
            //if there's CheckForSuspiciousSources=false in the URL, or if the experiment CheckForSuspiciousSources is not 'new', don't run
            if  ( (window.location.search.search(/[?&]CheckForSuspiciousSources=false/i) !== -1 ) ||
                ( (!W.isExperimentOpen('CheckForSuspiciousSources')) && (window.location.search.search(/[?&]CheckForSuspiciousSources=true/i) === -1 ))) {
                return;
            }

            var suspiciousSources = checkForSuspiciousSources(document);

            _.forEach(suspiciousSources, function (source) {
                var params = {
                    g1: source.hostname,
                    c1: source.source,
                    c2: source.tag,
                    i1: deployStatus && deployStatus.logs && deployStatus.logs.phases && deployStatus.logs.phases.length
                }
                LOG.reportEvent(wixEvents.SUSPECTED_MALWARE, params);
            });
        }
        catch(e){}
    }

    /**
     * Checks for the sources of elements in the document, and verifies them with the whitelist provided in 'validSourcesByTag' member.
     * @param dom the document on which the function should operate.
     * @returns {Array} of objects, key value nodes which are considered suspicious.
     */
    function checkForSuspiciousSources(dom) {
        var suspiciousSources = [];

        for (var currentTag in validSourcesByTag) {

            var nodes = getAllNodesByTag(dom,currentTag);
            _.forEach(nodes, function (node) {
                var passedValidation = false;

                _.forEach(validSourcesByTag[currentTag], function (validSource) {
                    if (node.source.match(validSource)) {
                        passedValidation = true;
                        return false; //break for _.forEach
                    }
                }, this);

                if (!passedValidation) {
                    //Needs to be encoded to prevent url params from mixing with the params of bi event
                    node.hostname = encodeURIComponent(extractHostname(node.source));
                    node.source = encodeURIComponent(node.source);
                    suspiciousSources.push(node);
                }
            }, this);
        }

        return suspiciousSources;
    }

    //Extract hostname from a full url
    function extractHostname(url) {
        var anchor = document.createElement('a');
        anchor.href = url;
        return anchor.hostname;
    }

    /**
     * Gets all the HTML nodes from a provided DOM by a 'tag'
     * @param dom the document on which the function should operate.
     * @param tag
     * @returns {Array} of HTML nodes, from a DOM, by a provided 'tag' parameter.
     */
    function getAllNodesByTag(dom,tag) {
        var nodeObjects = [];

        var htmlNodes = dom.getElementsByTagName(tag);

        _.forEach(htmlNodes, function (node) {
            var tag = node.nodeName;
            var currentNodeSource;

            currentNodeSource = ( tag === 'LINK' ) ? node.href : node.src;
            nodeObjects.push({ tag: tag, source: currentNodeSource });
        }, this);

        return nodeObjects;
    }

    // TODO:for now, it's a 10 sec timeout, just so we don't slow down the editor. however, a better way is to do something like newRelic, which identifies when the browser has finished loading scripts, and is therefore in idle

    setTimeout(executeValidator, 10000);

})();