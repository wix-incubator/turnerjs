declare var core: {
    componentUtils: {
        boxSlideShowCommon: {
            isBoxOrStripSlideShowComponent: (compType: string) => boolean;
            isBoxOrStripSlideShowSlideComponent: (compType: string) => boolean;
            getShownOnAllSlidesFromChildrenByStructure: (children: Component[]) => Component[];
            getSlidesFromChildrenByStructure: (children: Component[]) => Component[];
        };
    };
};


declare module 'core' {
    export = core
}
