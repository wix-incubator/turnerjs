//AKA GTM
//this script from google allows our marketting to manage their pixels and scripts without depending on development
define.Class("external_apis.GoogleTagManager", function(classDefinition){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['scriptLoader']);

    def.methods({
        initialize: function(mode) {
            if (mode==='viewer') {
                this._addGTM_script();
            }
            else {
                this._addGTM_iframe();
            }
        },

        _addGTM_script: function () {
            var firstScriptNode = document.getElementsByTagName('script')[0];
            var s = document.createElement('script');
            s.async = true;
            //just took the script part out of what's provided within our GTM account
            //note that our ID is GTM-MDD5C4. for now i didn't extract it from within their code below
            s.text = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MDD5C4');";
            firstScriptNode.parentNode.insertBefore(s, firstScriptNode);
        },

        _addGTM_iframe: function () {
            var i = document.createElement('iframe');
            i.style.display = "none";
            i.src='//static.parastorage.com/services/third-party/misc/GoogleTagManagerIframe.html?fromeditor';
            document.body.appendChild(i);
        }
    });
}) ;