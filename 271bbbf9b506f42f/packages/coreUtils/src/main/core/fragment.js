/**
 * Created by avim on 14/11/2016.
 */
define([], function () {
    'use strict';
    if (typeof window === 'undefined') {
        return {}; // polyfilled in server side using jsdom
    }
    return {
        document: {
            createDocumentFragment: window.document.createDocumentFragment.bind(window.document),
            createTextNode: window.document.createTextNode.bind(window.document),
            createElement: window.document.createElement.bind(window.document)
        },
        Node: {
            ELEMENT_NODE: window.Node.ELEMENT_NODE,
            ATTRIBUTE_NODE: window.Node.ATTRIBUTE_NODE,
            TEXT_NODE: window.Node.TEXT_NODE,
            CDATA_SECTION_NODE: window.Node.CDATA_SECTION_NODE,
            ENTITY_REFERENCE_NODE: window.Node.ENTITY_REFERENCE_NODE,
            ENTITY_NODE: window.Node.ENTITY_NODE,
            PROCESSING_INSTRUCTION_NODE: window.Node.PROCESSING_INSTRUCTION_NODE,
            COMMENT_NODE: window.Node.COMMENT_NODE,
            DOCUMENT_NODE: window.Node.DOCUMENT_NODE,
            DOCUMENT_TYPE_NODE: window.Node.DOCUMENT_TYPE_NODE,
            DOCUMENT_FRAGMENT_NODE: window.Node.DOCUMENT_FRAGMENT_NODE,
            NOTATION_NODE: window.Node.NOTATION_NODE,
            DOCUMENT_POSITION_DISCONNECTED: window.Node.DOCUMENT_POSITION_DISCONNECTED,
            DOCUMENT_POSITION_PRECEDING: window.Node.DOCUMENT_POSITION_PRECEDING,
            DOCUMENT_POSITION_FOLLOWING: window.Node.DOCUMENT_POSITION_FOLLOWING,
            DOCUMENT_POSITION_CONTAINS: window.Node.DOCUMENT_POSITION_CONTAINS,
            DOCUMENT_POSITION_CONTAINED_BY: window.Node.DOCUMENT_POSITION_CONTAINED_BY,
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: window.Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        }
    };
});
