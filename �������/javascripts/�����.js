// internationalization
$.i18n.setLocale("ru")

if (!$.fn.prop)
	$.fn.prop = $.fn.attr

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

var namespace = 'main'

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

/**
 * centers elements vertically
 */

var content_top_padding = 0 // will be computed on document load

$(function()
{
	content_top_padding = $('#panel').height()
	$('#content_top_padding').height(content_top_padding)
})

function center_horizontally()
{
	$('[center~="horizontally"]').each(function()
	{
		var $element = $(this)
		var position = $element.css('position')
		
		switch (position)
		{
			case 'absolute':
				$element.css('left', parseInt(($(window).width() - $element.width()) / 2) + 'px')
				return
				
			case 'relative':
				var pixels = parseInt(($(window).width() - $element.width()) / 2)
				$element.css('left', pixels + 'px')
				$element.css('margin-right', '-' + pixels + 'px')
				return
				
			default:
				if ($element.attr('class'))
					var classes =  '.' + $element.attr('class')
				else
					var classes =  ''
				
				alert('Unable to center ' + $element.get(0).tagName.toLowerCase() + '#' + $element.attr('id') + classes + ' horizontally')
				return
		}		
	})
}

$(window).resize(center_horizontally)

function center_vertically()
{
	$(".middle").each(function()
	{
		var $element = $(this)
		
		var parent_height = parseInt($element.parent().height())
		var height = parseInt($element.height())
		
		if (parent_height <= height)
		{
			$element.css({ top: 'auto' })
			return
		}

		var content_padding_amendment = 0
		
		if ($element.prop('parent') === 'content')
			content_top_padding
		
		$element.css
		({
			top: Math.round((parent_height - content_padding_amendment - height) / 2) + 'px'
		})
	})
}

$(window).resize(center_vertically)

/**
 * show loading screen
 */
function loading_page()
{
	$("body").css({ overflow: 'hidden' })
}

/**
 * hide loading screen
 */
function page_loaded()
{
	$('#loading_screen').fadeOut(300, function() { $('#loading_screen').remove() })
	$("body").css({ overflow: 'auto' })
	
	var $content = $('#content')
	$content.height((parseInt($content.height()) - parseInt($content.css('padding-top'))) + 'px')
}

// placeholder - will be overridden
function initialize_page() {}

var Ajax = 
{
	get: function(url, data, options)
	{
		this.request('GET', url, data, options);
	},
	
	put: function(url, data, options)
	{
		this.request('POST', url, Object.merge(data, { _method: 'put' }), options);
	},
	
	request: function(method, url, data, options)
	{
		$.ajax
		({
			url: url, 
			type: method,
			cache: false,
			data: data, 
			success: function(json, textStatus)
			{
				if (json.ошибка)
				{
					Message.error(json.ошибка)
					return
				}

				options.ok(json)
			},
			error: function(json, textStatus)
			{
				Message.error(options.error)
			},
			dataType: 'json'
		})
	}
}

function get_highest_z_index(top_z)
{
	if (!top_z)
		top_z = 0
		
	$('body *').each(function() 
	{
		var z_index = parseInt($(this).css('z-index'))
		if (z_index)
			if (top_z < z_index)
				top_z = z_index
	})
	
	return top_z
}