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

	var min_height = first_time_page_loading ? $(document).height() : $(document).height() - $('#panel').height()
	loading_screen.css('min-height', $(document).height() + 'px')
	
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
		
	if (!page.needs_initializing)
		hide_page_loading_screen()
}

function page_initialized()
{
	if (!page.needs_initializing)
		return

	hide_page_loading_screen()
}

function hide_page_loading_screen()
{
	var loading_screen = $('#loading_screen')
	
	loading_screen.fade_out(0.2, function()
	{
		loading_screen.find('.loading').stop_animator().fade_out(0)
	})
	
	$('body').removeClass('loading')
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

$(document).on('page_loaded', function()
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
	
	dummy_div.remove()
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

// copied from enginex.conf
var Page_url_patterns =
[
	/^\/$/,
	/^\/люди(\/(.*))?$/,
	/^\/читальня(\/(.*))?$/,
	/^\/помощь(\/(.*))?$/,
	/^\/управление(\/(.*))?$/,
	/^\/сеть\/((.*))?$/,
]

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
			
		if (link.data('static'))
			return
			
		if (link.attr('dummy'))
			return
		
		var is_a_page = false
		
		var i = 0
		while (i < Page_url_patterns.length)
		{
			if (url.match(Page_url_patterns[i]))
			{
				is_a_page = true
				break
			}
			
			i++
		}
			
		if (!is_a_page)
			return
			
		link.click(function(event)
		{
			if (event.button || event.ctrlKey || event.metaKey)
				return
				
			event.preventDefault()
			
			//if ('/' + путь_страницы() === url)
			//	return
			
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

function anti_cache_postfix(url)
{
	if (!url)
		return '?' + new Date().getTime()
	
	return url.before('?') + anti_cache_postfix()
}

window.onerror = function()
{
	navigating = false
	
	if (first_time_page_loading)
	{
		//if (путь_страницы() !== 'ошибка')
		//	window.location = '/ошибка' + '?' + 'url=' + encodeURI(window.location)
		error('Ошибка на сайте', { sticky: true })
	}
	else
	{
		page_loaded()
		//$("#page").empty().html('<div class="error">Ошибка на странице</div>')
		error('Ошибка на странице', { sticky: true })
	}
}

function escape_id(id)
{
	return id.replace_all('?', '%3F').replace_all('/', '%2F')
}