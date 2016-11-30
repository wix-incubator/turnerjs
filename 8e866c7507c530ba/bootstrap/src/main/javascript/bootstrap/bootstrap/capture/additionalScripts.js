(function(){
    var prefix = "static_mobile_";
    var tinyMenuDiv = document.getElementById(prefix + "TINY_MENU");
    var menuContainer;
    var menuButton;
    var menuUl;

    if (tinyMenuDiv){
        var tinyMenuChildren = tinyMenuDiv.children;
        if (tinyMenuChildren && tinyMenuChildren.length > 1){
            menuButton = tinyMenuChildren[0];
            menuContainer = tinyMenuChildren[1];
            if (menuContainer){
                var uls = menuContainer.getElementsByTagName('ul');
                if (uls && uls.length > 0){
                    menuUl = uls[0];
                }
            }
        }
    }

    if (menuButton){
        menuButton.addEventListener('click',function(event){
            if (menuContainer && menuUl){
                if (menuButton.className.indexOf('tiny-menu-open') > -1) {
                    closeTinyMenu();
                } else {
                    openTinyMenu();
                }
            }
        });
    }

    if (menuUl){
        var pagesItems = menuUl.getElementsByTagName('li');
        for (var i = 0; i < pagesItems.length; i++){
            var aTag = pagesItems[i].getElementsByTagName('a')[0];
            if (aTag){
                var link = aTag.getAttribute('link-ref');
                if (link){
                    aTag.addEventListener('click', function(link){
                        return function(event){
                            window.open(link, '_self');
                            closeTinyMenu();
                        };
                    }(link));
                }
            }
        }
    }

    if (menuContainer){
        menuContainer.addEventListener('click',function(event){
            var elm = event.target;
            if (elm.className.indexOf('tiny-menu-toggle-items') > -1) {
                var parentLi = elm.parentElement;
                toggleClass(parentLi, 'tiny-menu-open');
            }
        });
    }

    function closeTinyMenu(){
        if (menuUl.classList.contains('tiny-menu-open') || menuButton.classList.contains('tiny-menu-open')){
            menuUl.classList.remove('tiny-menu-open');
            menuButton.classList.remove('tiny-menu-open');
            menuContainer.classList.add("hidden");
        }
    }

    function openTinyMenu(){
        var menuItems = menuUl.children;
        for (var i = 0; i < menuItems.length; i++){
            var menuItem = menuItems[i];
            var hasChildren = menuItem.classList.contains('hasChildren');
            var subMenu = menuItem.getElementsByTagName('ul')[0];
            if (hasChildren && subMenu){
                subMenu = menuItem.getElementsByTagName('ul')[0];
                var hasCurrentPageInSubMenu = subMenu.querySelector('li>.tiny-menu-current-page');
                if(hasCurrentPageInSubMenu){
                    menuItem.classList.add('tiny-menu-open');
                } else {
                    menuItem.classList.remove('tiny-menu-open');
                }
            }
        }

        applyResponsiveStyling();
        menuUl.classList.add('tiny-menu-open');
        menuButton.classList.add('tiny-menu-open');
        menuContainer.classList.remove("hidden");
    }

    function applyResponsiveStyling(){
        var margin = 20;
        var siteStructureNode = document.getElementById(prefix + "SITE_STRUCTURE");
        var siteWidth = parseInt(siteStructureNode.style.width);
        var siteLeft =  siteStructureNode.getBoundingClientRect().left;
        siteWidth = siteWidth - (margin * 2);
        menuContainer.style.width = siteWidth + "px";
        var buttonLeft = tinyMenuDiv.getBoundingClientRect().left;
        buttonLeft = buttonLeft - siteLeft - margin;
        var distanceLeftDelta = -1 * (buttonLeft);
        menuContainer.style.left = distanceLeftDelta + "px";
    }

    function toggleClass(element, className){
        var newClassName;

        if(element.className.indexOf(className) > -1) {
            newClassName = element.className.replace(' ' + className, '');
        }
        else {
            newClassName = element.className + ' ' + className;
        }
        element.setAttribute('class', newClassName);
    }
}());