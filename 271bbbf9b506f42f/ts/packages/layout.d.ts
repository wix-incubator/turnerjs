declare var layout: {
    registerAdditionalMeasureFunction: (className: string, measureFunction: any) => void;
};


declare module 'layout' {
    export = layout
}
