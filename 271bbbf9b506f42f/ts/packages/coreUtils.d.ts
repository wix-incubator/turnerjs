declare var coreUtils: {
    dataUtils: {
        getAllCompsInStructure: (compStructure: { components?: Component[]; children?: Component[]; mobileComponents?: Component[]; }, isMobile?: boolean, filterFunc?: Function) => Map<Component>;
    };
    objectUtils: {
        cloneDeep: (value: any) => any;
    };
    boundingLayout: {
        getBoundingY: (layout: Layout) => number;
        getBoundingHeight: (layout: Layout) => number;
        getBoundingLayout: (layout: Layout) => Layout;
    };
};


declare module 'coreUtils' {
    export = coreUtils
}