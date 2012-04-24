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
 * show loading screen
 */
function loading_page(options)
{
	options = options || {}
	
	if (!first_time_page_loading)
	{
		$('aside').css('z-index', 2)
		$('.on_the_right_side_of_the_panel').css('z-index', 2)
	}
	
	if (options.full)
	{
		$('aside').css('z-index', 1)
		$('.on_the_right_side_of_the_panel').css('z-index', 1)
	}
	
	var loading_screen = $('#loading_screen')
	
	if (first_time_page_loading)
		loading_screen.height($(document).height())
	else
		loading_screen.height($(document).height() - $('#panel').height())
	
	loading_screen.find('> .content').css
	({
		'margin-top': (($(window).height() - 30) / 2) + 'px'
	})
	
	loading_screen.find('.loading').fade_in(2.0, { maximum_opacity: 0.5 })
	
	loading_screen.fade_in(0.2)
	$('body').addClass('loading')
		
	return function()
	{
		loading_screen.stop_animator().fade_in(0)
	}
}

/**
 * hide loading screen
 */
function page_loaded()
{
	if (first_time_page_loading)
		first_time_page_loading = false

	var loading_screen = $('#loading_screen')
	
	loading_screen.fade_out(0.2, function()
	{
		loading_screen.find('.loading').stop_animator().fade_out(0)
	})
	
	$('body').removeClass('loading')
}

// get jQuery element
function get_element(selector_or_element)
{
	if (typeof selector_or_element === "string")
		return $(selector_or_element)
		
	return selector_or_element
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
	
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		content.find(tag).each(function()
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
		прокрутчик.scroll_to(header, { make_room_for_text_readability : true })
}

function add_anchor_to_url(anchor)
{
	window.location.hash = anchor
	
	/*
	var hash_index = window.location.indexOf('#')
	if (hash_index)
		window.location = window.location.substring(0, hash_index) + '#' + anchor
	else
		window.location = window.location + '#' + anchor
	*/
}

function activate_anchors()
{
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		content.find(tag).each(function()
		{
			var element = $(this)
			
			if (element.data('anchored'))
				return
				
			element.data('anchored', true)
			
			if (element.children().length > 0)
				return
			
			element.on_page('click.scroll', function(event)
			{
				event.preventDefault()
				
				if (Режим.правка_ли())
					return
				
				add_anchor_to_url(element.text())
				прокрутчик.scroll_to(element, { make_room_for_text_readability : true })
			})
		})
	})
}

$(document).on('page_loaded', function()
{
	activate_anchors()
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

String.prototype.matches = function(pattern)
{
	var expression = pattern
	if (expression.constructor !== 'RegExp')
		expression = new RegExp(pattern, 'g')
	
	var match = this.match(expression)
	if (!match)
		return false
		
	return true //this.match(what).length
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
	var index = this.lastIndexOf(substring)
	return index >= 0 && index === this.length - substring.length
}

String.prototype.chop_on_the_end = function(how_much) 
{
	return this.substring(0, this.length - how_much)
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

String.prototype.collapse_lines = function()
{
	return this.replace(/\n/g, '')
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

function путь_страницы(url)
{
	url = url || window.location
	
	var путь = parseUri(decodeURI(url)).path.substring(1)
	
	var hash_index = путь.indexOf('#')
	if (hash_index >= 0)
		путь = путь.substring(0, hash_index)
	
	if (путь.ends_with('/'))
		путь = путь.chop_on_the_end(1)
		
	return путь
}

// HTML escaping

String.prototype.escape_html = function() 
{
	return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
}

Function.prototype.ticking = function(period, bind, arguments)
{
	var running = true
	var timeout_id
	
	var func = this
	var periodical = function()
	{
		if (func() === false)
			return
		if (running)
			next()
	}
	
	var next = function()
	{
		timeout_id = periodical.delay(period, bind, arguments)
	}
	
	periodical()
	return { stop: function() { clearTimeout(timeout_id); running = false } }
}

function activate_button(selector, options)
{
	var element = $(selector)

	options = options || {}
	options.selector = selector

	if (!options.physics)
		options.physics = 'classic'
		
	return button.physics[options.physics](new text_button
	(
		element,
		Object.append
		(
			{
				skin: 'sociopathy',
				
				// miscellaneous
				'button type':  element.attr('type'), // || 'generic',
			},
			options
		)
	))
}

$(function()
{
	if (navigator.userAgent.indexOf("Mac"))
	{
		$('body').addClass('osx')
	}
	else if (navigator.userAgent.indexOf("Mac"))
	{
		$('body').addClass('windows')
	}
})

function title(text)
{
	if (!text)
		return document.title
		
	document.title = text
}

function breadcrumbs(path, on_ok, on_error)
{
	var template_url = '/страницы/кусочки/breadcrumbs.html'

	page.Ajax.get(template_url, {}, { type: 'html' })
	.ошибка(function()
	{
		on_error()
	})
	.ok(function(template) 
	{
		$.template(template_url, template)
		$('.breadcrumbs_container').append($.tmpl(template_url, { path: path }))
		on_ok()
	})
}

// чтобы не было ошибок по консоли в обозревателе
if (!console)
	console = { log: function() {} }

// body background css transitions didn't work
function initialize_body_edit_mode_effects()
{
	var initial_background_color = $('body').css('background-color')
	
	var dummy_div = $('<div/>').hide().appendTo('body').addClass('body_edit_mode')
	
	var background_fade_time = dummy_div.transition_duration() * 1000
	var edit_mode_background_color = dummy_div.css('background-color')
	
	$(document).on_page('режим.правка', function()
	{
		$('body').stop(true, false).animate({ 'background-color': edit_mode_background_color }, background_fade_time)
	})

	$(document).on_page('режим.переход', function(event, из, в)
	{
		if (из === 'правка')
		{
			$('body').stop(true, false).animate({ 'background-color': initial_background_color }, background_fade_time)
		}
	})
}

function set_url(url, title, data)
{
	title = title || window.title
	data = data || {}
	window.history.replaceState(data, title, url)
}

function set_new_url(url, title, data)
{
	title = title || window.title
	data = data || {}
	window.history.pushState(data, title, url)
}

function ajaxify_internal_links(where)
{
	if (!where)
		where = $('body')
		
	where.find('a').each(function()
	{
		var link = $(this)
		var url = link.attr('href')
		
		if (!url.starts_with('/'))
			return
			
		if (link.data('ajaxified'))
			return
			
		if (link.attr('dummy'))
			return
			
		link.click(function(event)
		{
			if (event.button)
				return
				
			event.preventDefault()
			
			if ('/' + путь_страницы() === url)
				return
			
			navigate_to_page(url,
			{
				before: function() { set_new_url(url) }
			})
		})
		
		link.data('ajaxified', true)
	})
}

var класс_ошибки_по_уровню = function(уровень)
{
	switch (уровень)
	{
		case 'ничего страшного':
			return 'nothing_serious'
	}
}

var ошибка_на_экране = function(ошибка)
{
	if (!ошибка.текст)
		return $('<span/>').text(ошибка)
		
	return $('<span/>').addClass(класс_ошибки_по_уровню(ошибка.уровень)).text(ошибка.текст)
}

function random_id()
{
	return Math.random() + '@' + new Date().getTime()
}

$.fn.on_page = function(event, action)
{
	if (!page)
		throw 'Page hasn\'t been initialized yet'
		
	page.on(this, event, action)
}