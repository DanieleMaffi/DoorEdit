(function ($) {

	"use strict";

	let sidebarInit = function () {
		let isCollapsed = window.localStorage.getItem('sidebarCollapse');
		if (isCollapsed === 'true') 
		$('#sidebar').addClass('active');
	}()

	let fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// Constantly checking the width
	// This will ensure that tha sidebar automatically closes when the screen shrinks
	$(window).resize(function() {
        // Get the updated window width
        var newWidth = $(window).width();

        if (newWidth <= 991.98)
			$('#sidebar').removeClass('active');
    });

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');

		const currentValue = window.localStorage.getItem('sidebarCollapse');

		if (currentValue === null) {
			// If 'sidebarCollapse' doesn't exist in localStorage, set it to true
			window.localStorage.setItem('sidebarCollapse', true);
		} else {
			// Toggle the value of 'sidebarCollapse'
			window.localStorage.setItem('sidebarCollapse', currentValue === 'true' ? 'false' : 'true');
		}

	});

})(jQuery);
