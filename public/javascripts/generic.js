// internationalization
$.i18n.setLocale("ru")

// show error message on error

//$.ajaxError(show_error_message)

// dimensions

function get_page_height()
{
	return $(document).height();
}

function get_page_width()
{
	return $(document).width();
}
	
function get_viewport_height()
{
	return $(window).height();
}

function get_viewport_width()
{
	return $(window).width();
}

function get_scroll_x() 
{
	if (document.documentElement && document.documentElement.scrollLeft)
		return document.documentElement.scrollLeft
		
	if (document.body && document.body.scrollLeft)
		return document.body.scrollLeft
		
	if (window.pageXOffset)
		return window.pageXOffset
		
	if (window.scrollX)
		return window.scrollX
		
	return 0
}

function get_scroll_y() 
{
	if (document.documentElement && document.documentElement.scrollTop)
		return document.documentElement.scrollTop
		
	if (document.body && document.body.scrollTop)
		return document.body.scrollTop
		
	if (window.pageYOffset)
		return window.pageYOffset
		
	if (window.scrollY)
		return window.scrollY
		
	return 0
}

// page scrolling helpers

/**
 * retrieves the current scroll position: (left, top)
 */
function get_scroll_position()
{
	var scroll_position = 
	{
		x: get_scroll_x(),
		y: get_scroll_y()
	}
	
	return scroll_position
}

/**
 * disables page scrolling
 */
function disable_scroll()
{
	$(window).bind('scroll.' + namespace, {scroll_position: get_scroll_position()}, function(event) 
	{
		window.scrollTo(event.data.scroll_position.x, event.data.scroll_position.y)
    	return false
	})
}

/**
 * enables page scrolling
 */
function enable_scroll()
{
	$(window).unbind('scroll.' + namespace)
}
