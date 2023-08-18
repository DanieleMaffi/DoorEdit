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
