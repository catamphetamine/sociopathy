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
function loading_page()
{
	$("body").css({ height: '100%', overflow: 'hidden' })
}
 */

/**
 * hide loading screen
 */
function page_loaded()
{
	$('#loading_screen').fadeOut(300, function() { $('#loading_screen').remove() })
	//$("body").css({ overflow: 'auto' })
	$('body').removeClass('loading')
	
	//var $content = $('#content')
	//$content.height((parseInt($content.height()) - parseInt($content.css('padding-top'))) + 'px')
}

// placeholder - will be overridden
function initialize_page() {}

// get jQuery element
function get_element(selector_or_element)
{
	if (typeof selector_or_element === "string")
		return $(selector_or_element)
		
	return selector_or_element
}

function initialize_conditional($this, options)
{
	var conditional

	var fade_in_duration = 500
	var fade_out_duration = 200
	
	var every = $this.children()

	var ok = $this.find('> [type=ok]').eq(0)
	
	var error = $this.find('> [type=error]').eq(0)
	error.attr('default_message', error.text())

	var loading = $this.find('> [type=loading]').eq(0)
	var loading_more = $this.find('> [type=loading_more]').eq(0)

	var loading_more_error = $this.find('> [type=loading_more_error]').eq(0)

	if (loading_more_error.length === 0)
		loading_more_error = error
	else
		loading_more_error.attr('default_message', loading_more_error.text())
	
	loading.addClass('non_selectable')	
	error.addClass('non_selectable')	
	loading_more.addClass('non_selectable')	
	loading_more_error.addClass('non_selectable')
	
	var tries = $this.attr('tries') || 1
	
	var callback = function(error, callback)
	{
		if (error)
			return on_error(error, callback)
			
		on_ok(callback)
	}
	
	var hide_every = function()
	{
		every.each(function()
		{
			$(this).hide()
		})
	}
	
	hide_every()
	$this.show()
	loading.fadeIn(fade_in_duration)
	
	var switch_elements = function(from, to, callback)
	{
		from.fadeOut(fade_out_duration, function()
		{
			to.fadeIn(fade_in_duration, callback)
		})
	}
	
	var on_ok = function(callback)
	{
		if (conditional.state !== 'loading')
		{
			loading = loading_more
		}
		
		switch_elements(loading, ok, function()
		{
			conditional.state = 'loaded'
			
			if (callback)
				callback()
		})
	}
	
	var error_counter = 0
	var on_error = function(message, on_error_callback)
	{
		error_counter++
		
		if (error_counter < tries)
			return action(callback)
		
		if (conditional.state !== 'loading')
		{
			error = loading_more_error
			loading = loading_more
		}
		
		if (message && typeof(message) === 'string')
			error.text(message)
		else
			error.text(error.attr('default_message'))
		
		switch_elements(loading, error, function()
		{
			conditional.state = 'error'
			
			if (on_error_callback)
				on_error_callback()
		})
	}
	
	var loading_more_function = function()
	{
		conditional.state = 'loading more'
		loading_more.fadeIn(fade_in_duration)
	}
	
	conditional =
	{
		callback: callback,
		state: 'loading',
		loading_more: loading_more_function
	}
	
	return conditional
}

$(function()
{
	$('form').submit(function(event)
	{
		event.preventDefault()
	})
})

RegExp.escape = function(string)
{
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g")
	return string.replace(specials, "\\$&")
}

String.prototype.replace_all = function(what, with_what)
{
	var regexp = new RegExp(RegExp.escape(what), "g")
	return this.replace(regexp, with_what)
}

String.prototype.set_character_at = function(index, character)
{
	if (index > this.length - 1)
		return this
		
	return this.substr(0, index) + character + this.substr(index + 1)
}

String.prototype.beautify = function()
{
	var string = this + ''
	
	function replace_quotes(which, string)
	{
		var quote_index = -1
		var found_quote_type
		while ((quote_index = string.indexOf(which, quote_index + 1)) >= 0)
		{
			if (found_quote_type === 'odd')
				found_quote_type = 'even'
			else
				found_quote_type = 'odd'
		
			var beautiful_quote
			if (found_quote_type === 'odd')
				beautiful_quote = '«'
			else
				beautiful_quote = '»'
				
			string = string.set_character_at(quote_index, beautiful_quote)
		}
		
		return string
	}
	
	string = replace_quotes('"', string)
	//string = replace_quotes("'", string)
	
	string = string.replace_all(' - ', ' — ')

	// заменить три точки на троеточие
	string = string.replace(/([^\.]+)\.\.\.([^\.]+)/g, '$1…$2')
	string = string.replace(/^\.\.\.([^\.]+)/g, '…$1')
	string = string.replace(/([^\.]+)\.\.\.$/g, '$1…')
	string = string.replace(/^\.\.\.$/g, '…')
	
	return string
}

function go_to_anchor()
{
	var anchor = get_hash()
	
	if (!anchor)
		return

	var header
	var container = $('#content');
	
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		container.find(tag).each(function()
		{
			if (header)
				return
			
			var element = $(this)
			if (element.children().length > 0)
				return
				
			if (element.text() === anchor)
				header = element
		})
		
		if (header)
			return
	})
	
	if (header)
		прокрутчик.scroll_to(header)
}

function add_anchor_to_url(anchor)
{
	window.location.hash = anchor
	return
	
	var hash_index = window.location.indexOf('#')
	if (hash_index)
		window.location = window.location.substring(0, hash_index) + '#' + anchor
	else
		window.location = window.location + '#' + anchor
}

$(function()
{
	var container = $('#content');
	
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		container.find(tag).each(function()
		{
			var element = $(this)
			if (element.children().length > 0)
				return
				
			element.click(function(event)
			{
				event.preventDefault()
				
				if (Режим.правка())
					return
				
				add_anchor_to_url(element.text())
				прокрутчик.scroll_to(element)
			})
		})
	})
})

String.prototype.count = function(what)
{
	if (typeof(what) === 'string')
	{
		var count = 0
		var index = -1
		while ((index = this.indexOf(what, index + 1)) >= 0)
			count++
		
		return count
	}
	
	if (what.constructor === RegExp)
	{
		var match = this.match(what)
		if (!match)
			return 0
			
		return this.match(what).length
	}
}

function now()
{
	return new Date()
}

Array.prototype.is_empty = function()
{
	return this.length === 0
}

String.prototype.starts_with = function(substring) 
{
	return this.indexOf(substring) === 0
}

String.prototype.ends_with = function(substring) 
{
	return this.lastIndexOf(substring) === this.length - substring.length
}

String.prototype.trim_trailing_comma = function()
{
	var text = this.trim()
	
	if (text.match(/[^\.]+\.$/))
		text = text.substring(0, text.length - 1)
		
	return text
}

String.prototype.is_multiline = function()
{
	return this.contains('\n')
}

String.prototype.contains = function(what)
{
	return this.indexOf(what) >= 0
}

/*
Object.forEach = function(object, action)
{
	Object.each(object, function(value, key)
	{
		if (object.hasOwnProperty(key))
		{
			console.log(key)
			action(value, key)
		}
	})
}
*/

$(function()
{
	var body = $('body')

	if($.browser.mozilla)
		body.addClass('firefox')
	else if($.browser.opera)
		body.addClass('opera')
	else if($.browser.webkit)
		body.addClass('webkit')
})

