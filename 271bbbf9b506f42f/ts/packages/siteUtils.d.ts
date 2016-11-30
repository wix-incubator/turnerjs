declare var siteUtils: {
    mobileUtils: {
        getMinFontSize: () => number;
        convertFontSizeToMobile: (fontSize: number, scale: number) => number;
    }
    fullToDisplayedJson: {
        getDisplayedJson: (fullJsonFragment: Component | PageComponent | MasterPageComponent, activeModes: Map<Map<boolean>>, rootId: string) => PageData;
    }
};

declare module 'siteUtils' {
    export = siteUtils
}