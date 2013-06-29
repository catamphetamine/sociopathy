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

var first_time_page_loading = true

/**
 * show loading screen
 */
function loading_page(options, callback)
{
	if (!callback)
	{
		callback = options
		options = {}
	}
	else
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

	var min_height = first_time_page_loading ? $(document).height() : $(document).height() - $('#panel').height()
	loading_screen.css('min-height', $(document).height() + 'px')
	
	loading_screen.find('> .content').css
	({
		'margin-top': (($(window).height() - 30) / 2) + 'px'
	})
	
	loading_screen.find('.loading').fade_in(2.0, { maximum_opacity: 0.5 })
	
	var fade_in_for = Configuration.Loading_screen.Fade_in
	if (options.immediate)
		fade_in_for = 0
	
	$('body').addClass('loading')
	
	loading_screen.fade_in(fade_in_for, callback)
}

/**
 * hide loading screen
 */
function page_initialized()
{
	if (first_time_page_loading)
		first_time_page_loading = false
		
	if (!page.needs_to_load_content)
	{
		page.content_ready()
		hide_page_loading_screen()
	}
}

function hide_page_loading_screen()
{
	var loading_screen = $('#loading_screen')
	
	loading_screen.fade_out(Configuration.Loading_screen.Fade_out, function()
	{
		loading_screen.find('.loading').stop_animator().fade_out(0)
	})
	
	$('body').removeClass('loading')
}

function web_page_still_loading()
{
	return $('body').hasClass('loading')
}

$(function()
{
	$('form').submit(function(event)
	{
		event.preventDefault()
	})
})

function go_to_anchor()
{
	var anchor = get_hash()
	
	if (!anchor)
		return

	var header
	
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		page.get(tag).each(function()
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
		прокрутчик.scroll_to(header, { make_room_for_text_readability: true })
}

function get_url_without_hash()
{
	var url = window.location.href
	
	var hash_index = url.indexOf('#')
	if (hash_index >= 0)
		return url.substring(0, hash_index)

	return url
}

function add_anchor_to_url(anchor)
{
	set_url(get_url_without_hash() + '#' + anchor)
}

function activate_anchors()
{
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag)
	{
		page.get(tag).each(function()
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

$(document).on('page_initialized', function()
{
	activate_anchors()
})

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

$(function()
{
	if (navigator.userAgent.indexOf("Mac") >= 0)
	{
		$('body').addClass('osx')
	}
	else if (navigator.userAgent.indexOf("Windows") >= 0)
	{
		$('body').addClass('windows')
	}
})

var title = (function()
{
	var notify_title_changed = true
	function title(text)
	{
		if (!text)
			return document.title
			
		document.title = text
		
		if (window_notification)
			if (window_notification.title_changed)
			{
				if (!notify_title_changed)
					return
				
				notify_title_changed = false
				window_notification.title_changed()
				notify_title_changed = true
			}
	}
	
	return title
})()

function breadcrumbs(path, on_ok, on_error)
{
	$('.breadcrumbs_container').append($.tmpl('breadcrumbs', { path: path }))
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
	
	Режим.при_переходе({ в: 'правка' }, function()
	{
		$('body').stop(true, false).animate({ 'background-color': edit_mode_background_color }, background_fade_time)
		$('body').stop(true, false).css({ 'background-color': edit_mode_background_color })
	})

	$(document).on_page('смена_режима', function(event, из, в)
	{
		if (из === 'правка')
		{
			$('body').stop(true, false).animate({ 'background-color': initial_background_color }, background_fade_time)
		}
	})
	
	dummy_div.remove()
}

var history_stacked = false

// просто заменить текущий url на этот
function set_url(url, title, data)
{
	title = title || window.title
	
	data = data || {}
	data.scrolled = $(window).scrollTop()
	
	window.history.replaceState(data, title, url)
	history_stacked = true
}

// как бы перейти на новый url
function set_new_url(url, title, data)
{
	title = title || window.title
	
	data = data || {}
	data.scrolled = $(window).scrollTop()
	
	window.history.replaceState(data, window.title, window.location)
	
	window.history.pushState(data, title, url)
	history_stacked = true
}

function reload_page()
{
	navigate_to_page(Uri.parse().to_relative_url())
}

function reload_web_page()
{
	document.location.reload(true)
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
		
	var error = $('<span/>')
	
	if (ошибка.уровень)
		error.addClass(класс_ошибки_по_уровню(ошибка.уровень))
		
	error.text(ошибка.текст)
	return error
}

function random_id()
{
	return Math.random() + '@' + new Date().getTime()
}

/*
function anti_cache_postfix(url)
{
	if (!url)
		return '?' + new Date().getTime()
	
	return url.before('?') + anti_cache_postfix()
}
*/

function dont_show_error(ошибка)
{
	return '[don\'t show this error] ' + ошибка
}

function show_error(выпавшая_ошибка, url, line)
{
	if ((выпавшая_ошибка + '').indexOf('[don\'t show this error] ') >= 0)
		return
	
	var non_critical = false
	var inform_user = true
	var verbose = false
	var ошибка = выпавшая_ошибка + ''
	var explanation
	
	//console.log('выпавшая_ошибка')
	//console.log(выпавшая_ошибка)
	
	if (typeof выпавшая_ошибка === 'object')
	{
		if (выпавшая_ошибка.ошибка)
		{
			non_critical = выпавшая_ошибка.non_critical
			
			if (typeof выпавшая_ошибка.inform_user !== 'undefined')
				inform_user = выпавшая_ошибка.inform_user
			
			verbose = выпавшая_ошибка.verbose
			ошибка = выпавшая_ошибка.ошибка
			explanation = выпавшая_ошибка.explanation
		}
		else
			throw выпавшая_ошибка
		//console.log(выпавшая_ошибка.ошибка)
	}
	
	console.error('**** Error in ' + url + ' at line ' + line + ': ' + ошибка)
	
	if (non_critical)
		return
	
	// если шли на какую-то (возможно другую) страницу - говорим, что уже не идём
	navigating = false

	if (first_time_page_loading)
	{
		//if (путь_страницы() !== 'ошибка')
		//	window.location = '/ошибка' + '?' + 'url=' + encodeURI(window.location)
	}
	else
	{
		page_initialized()
	}
	
	if (error && inform_user)
	{
		if (!verbose)
			error('Ошибка на странице', { sticky: true })
		else
		{
			error(ошибка, { sticky: true })
			
			if (explanation)
				warning(explanation, { sticky: true })
		}
	}
}

function get_error_message(ошибка)
{
	if (typeof ошибка === 'string')
		return ошибка
	
	if (typeof ошибка === 'object')
		return ошибка.ошибка
	
	return ошибка + ''
}

/*
function error(error)
{
	console.log(error)
}
*/

//if (!window.development_mode)
	window.onerror = function(ошибка, url, line)
	{
		//console.log('Error:')
		
		//if (ошибка.contains('MathJax is not defined'))
		//	return warning('Формулы временно не работают')
		
		// игнорировать ошибки разрыва соединения с WebSocket в FireFox
		// "contains" may cause error, if it isn't loaded
		if (ошибка && typeof ошибка === 'string')
		{
			if (ошибка.indexOf('InvalidStateError: An attempt was made to use an object that is not, or is no longer, usable') >= 0)
				ошибка = { ошибка: ошибка, non_critical: true }
			else if (ошибка.indexOf('INVALID_STATE_ERR: DOM Exception 11') >= 0)
				ошибка = { ошибка: ошибка, non_critical: true } //return
		}
		
		if (ошибка && !ошибка.non_critical)
		{
			report_error(null, ошибка)
		}
	
		show_error(ошибка, url, line)
	}

function есть_ли_полномочия(какие)
{
	return пользователь && пользователь.полномочия && пользователь.полномочия.contains(какие)
}

window.request_animation_frame =
		window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame

function animate(element, render)
{
	if (element instanceof jQuery)
		element = element.node()
		
	;(function animation_loop(now)
	{
		var result = render(now)
		if (result === false)
			return
		
		request_animation_frame(animation_loop, element)
	})()
}

function correct_internal_url(url)
{
	if (url.starts_with('/'))
		if (!url.starts_with('/приложение/'))
			return '/приложение' + url
		
	return url
}

var Communication_types = []

function Communication_type(type, options)
{
	Communication_types.add({ type: type, options: options })
}