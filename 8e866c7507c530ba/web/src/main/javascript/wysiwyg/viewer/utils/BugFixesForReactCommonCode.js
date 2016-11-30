define.resource('BugFixesForReactCommonCode',{

    enforceAnchorsRecurse: function (comp, layoutManager) {
        var childComps;
        if (!comp.getChildComponents) {
            return;
        }
        if (comp.getCurrentChildren) {
            childComps = comp.getCurrentChildren();
        } else {
            childComps = comp.getChildComponents();
        }
        var changed = [];
        var heightChangedByChildren = false;
        for (var i = 0; i < childComps.length; i++) {
            if (childComps[i].$logic && childComps[i].$alive) {
                heightChangedByChildren = this.enforceAnchorsRecurse(childComps[i].$logic, layoutManager);
                if (heightChangedByChildren || childComps[i].$logic.wasHeightChanged()) {
                    childComps[i].$logic.validateHeight();
                    changed.push(childComps[i].$logic);
                }
            }
        }
        if (changed.length == 0) {
            return false;
        }

        // BugFixesForReact - the only change is set the isTopDirty to true
        return layoutManager.enforceAnchors(changed, true, undefined, undefined, true);
    }
});