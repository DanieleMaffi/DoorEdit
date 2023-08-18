(function ($) {

    let sidebarInit = function () {
        let isCollapsed = window.localStorage.getItem('sidebarCollapse');
        if (isCollapsed === 'true')
            $('#sidebar').addClass('active');
    }()

})(jQuery);