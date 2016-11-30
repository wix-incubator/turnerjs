define(['lodash'], function (_) {
    'use strict';

     return function (refData, skinTree, structure, props) {
         if (refData[""]){
             var refDataStyle = refData[""].style;
             if (refDataStyle && _.get(structure, 'layout.fixedPosition')) { //even if comp is not rendered in fixed, but if it will be in preview

                 // SO UGLY, SO SORRY... there is a chrome rendering bug when keeping z-index but changing from absolute to fixed position and also changing the position of the component
                 // which affects the editor and causes comps to move when switching from editor to preview until the next render
                 // changing the z-index forces chrome to re-render the components since it changed stacking order.
                 // The bug does not happen in other browsers... so for now, we will keep this here. Otherwise, we would always have zIndex of 50.
                 var zIndex = props.renderFlags.renderFixedPositionContainers ? 50 : 49;
                 refDataStyle.zIndex = Math.max(refDataStyle.zIndex || 0, zIndex);
                 /** note: seen z-index.scss, which is why we have the 49,50 */
             }
         }
    };
});
