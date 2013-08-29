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
	$('body').removeClass('first_time_loading')
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

show_error = function(выпавшая_ошибка, url, line)
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

function correct_data_url(url)
{
	if (url.starts_with('/'))
		if (!url.starts_with('/приложение/') && !url.starts_with('/upload/'))
			return '/приложение' + url
		
	return url
}

var Communication_types = []

function Communication_type(type, options)
{
	Communication_types.add({ type: type, options: options })
}

window.AudioContext = window.AudioContext || window.webkitAudioContext

var Sound = new Class
({
	initialize: function(url, callback)
	{
		//this.url = url
	
		this.context = new AudioContext()
	
		var request = new XMLHttpRequest()
		request.open('GET', url, true)
		request.responseType = 'arraybuffer'
		
		var sound = this
		
		// Decode asynchronously
		request.onload = function()
		{
			sound.context.decodeAudioData(request.response, function(data)
			{
				sound.data = data
				
				callback()
			},
			function(error)
			{
				console.error('Couldn\'t load sound: ' + url)
				console.error(error)
				
				callback(error)
			})
		}
		
		request.send()
	},
	
	play: function()
	{
		var source = this.context.createBufferSource()
		source.buffer = this.buffer
		source.connect(this.context.destination)
		source.start(0)
		// note: on older systems, may have to use deprecated noteOn(time);
	}
})

var Ajax = 
{
	get: function(url, data, options)
	{
		return this.request('GET', url, data, options);
	},
	
	post: function(url, data, options)
	{
		return this.request('POST', url, data, options);
	},
	
	put: function(url, data, options)
	{
		return this.request('POST', url, Object.merge(data, { _method: 'put' }), options);
	},
	
	'delete': function(url, data, options)
	{
		return this.request('POST', url, Object.merge(data, { _method: 'delete' }), options);
	},
	
	request: function(method, url, data, options)
	{
		options = options || {}
		
		options.type = options.type || 'json'
		
		if (options.type === 'json')
			url = correct_data_url(url)
		
		//var id = Math.random() + '@' + new Date().getTime()
		var result =
		{
			valid: true,
			expired: function()
			{
				return !this.valid
			},
			expire: function()
			{
				this.valid = false
			}
		}
	
		Default_ajax_error_message = 'Произошла ошибка на сервере'
		
		var jQuery_options = 
		{
			url: url, 
			type: method,
			data: data, 
			dataType: options.type,
			timeout: 15000
		}
		
		//if (window.development_mode)
		//	jQuery_options.cache = false
		
		if (options.jQuery)
			$.extend(jQuery_options, options.jQuery)
			
		var ajax = $.ajax(jQuery_options)
		
		result.abort = function() { ajax.abort() }
		
		var default_on_error = function(сообщение)
		{
			error(сообщение)
		}
		
		var on_error = default_on_error
		
		result.ok = function(ok)
		{
			var on_ok = function(data)
			{
				if ($.isFunction(ok))
					ok(data)
				else if (typeof(ok) === 'string')
					info(ok)
				else
					error('Неправильная настройка ok: ' + ok)
			}
			
			ajax.success(function(data, textStatus)
			{
				if (result.expired())
					return
			
				if (!data)
					return console.log('No output for Ajax request')
			
				if (data.ошибка)
					data.error = data.ошибка
			
				if (data.error)
				{
					var сообщение = data.error
					if (сообщение == true)
						сообщение = Default_ajax_error_message
						
					if (сообщение.текст)
						сообщение = сообщение.текст
						
					if (data.уровень !== 'ничего страшного')
						report_error('ajax', data.debug || сообщение)
						
					return on_error(сообщение, { уровень: data.error.уровень, показать: data.error.показать, data: data })
				}
				
				on_ok(data)
			})
			
			return result
		}
		
		result.ошибка = function(ошибка)
		{
			if (result.expired())
				return
				
			on_error = function(сообщение, options)
			{
				options = options || {}
				
				if (сообщение === 'Internal Server Error')
					сообщение = Default_ajax_error_message
					
				if (сообщение === 'abort')
					if (page.navigating_away)
						return
				
				if ($.isFunction(ошибка))
				{
					if (web_page_still_loading())
						if (options.показать !== false)
							error(сообщение, { sticky: true })
				
					ошибка(сообщение, options)
				}
				else if (сообщение && typeof сообщение === 'string')
				{
					if (options.показать !== false)
						error(сообщение)
				}
				else if (typeof ошибка === 'string')
					error(ошибка)
				else
					default_on_error()
			}
			
			ajax.error(function(jqXHR, textStatus, errorThrown)
			{
				on_error(errorThrown)
			})
			
			return result
		}
		
		return result
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

function получить_настройку_запроса(name, url)
{
	if (!url)
		url = decodeURI(window.location.href)

	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")
	var regexS = "[\\?&]"+name+"=([^&#]*)"
	var regex = new RegExp( regexS )
	var results = regex.exec(url)
	
	if (results == null)
		return null
		
	return decodeURIComponent(results[1])
}

/*
время в чате: 
меньше минуты - не писать ничего
от минуты до получаса - количество минут
до 3/4 часа - полчаса
до часа и четверти - час
до часа и трёх четвертей - полтора часа

до двух с половиной часов - два часа
до трёх с половиной часов - три часа
...
до 23 с половиной часов - 23 часа
до суток с половиной - сутки
до двух суток с половиной - двое суток
...
до шести суток с половиной - шесть суток
до недели с половиной - неделя
до двух недель с половиной - две недели
до трёх недель с половиной - три недели
до месяца с половиной - месяц
до двух месяцев с половиной - два месяца
...
до пяти месяцев с половиной - пять месяцев
до года с половиной - год
до двух лет с половиной - два года
...
*/
function неточное_время(время, options)
{
	options = options || {}
	
	var time
	
	if (typeof время === 'string')
		time = (Date.parse(время) || new Date(время)).getTime()
	else if (typeof время === 'number')
		time = время
	else if (время.constructor === Date)
		time = время.getTime()
	else
	{
		console.log(время)
		console.log(typeof время)
		console.log(время.constructor)
		throw 'Unsupported time: ' + время
	}

	var разница = (new Date().getTime() - time) / 1000
	
	var окончание_единицы_измерения
	
	if (разница < 0)
	{
		if (-разница > 60 * 1000)
		{
			console.log('разница: ' + разница)
			console.log('сейчас: ' + new Date())
			console.log('пришло: ' + время)
			console.log('now time: ' + new Date().getTime())
			console.log('time: ' + time)
			
			return время
		}
		
		разница = 0
	}
	
	var точные_минуты = разница / 60
	var минуты = Math.floor(точные_минуты)
	if (минуты < 1)
	{
		if (options.blank_if_just_now)
			return
		
		var just_now = text('human readable time.just now')
		just_now.just_now = true
		return just_now
	}
		
	if (минуты == 1)
		if (has_text('human readable time.a minute ago'))
			return text('human readable time.a minute ago')
	
	if (минуты <= 25)
	{
		if (last_digit(минуты) == 1 && минуты !== 11)
			окончание_единицы_измерения = 'ой'
		else
			окончание_единицы_измерения = 'ами'
	
		if (has_text('human readable time.N minutes ago'))
			return text('human readable time.N minutes ago').replace('N', минуты)
		
		return минуты + '-' + number_ending(минуты, { вопрос: 'чем', род: 'женский' }) + ' минут' + окончание_единицы_измерения + ' ранее'
	}
	
	var точные_часы = точные_минуты / 60
	var часы = Math.floor(точные_часы)
	if (часы < 0.75)
		return text('human readable time.half an hour ago')
		
	if (часы < 1.25)
		return text('human readable time.an hour ago')
		
	if (часы < 1.75)
		if (has_text('human readable time.one and a half an hour ago'))
			return text('human readable time.one and a half an hour ago')
	
	var количество_часов = 2
	while (количество_часов <= 23)
	{
		if (last_digit(количество_часов) == 1 && количество_часов !== 11)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (часы < количество_часов + 0.5)
		{
			if (has_text('human readable time.N hours ago'))
				return text('human readable time.N hours ago').replace('N', количество_часов)
			
			return количество_часов + '-' + number_ending(количество_часов, { вопрос: 'чем', род: 'мужской' }) + ' час' + окончание_единицы_измерения + ' ранее'
		}
			
		количество_часов++
	}
	
	var точные_сутки = точные_часы / 24
	var сутки = Math.floor(точные_сутки)
	if (сутки < 1.5)
		return text('human readable time.a day ago')
		
	var количество_суток = 2
	while (количество_суток <= 6)
	{
		if (сутки < количество_суток + 0.5)
		{
			if (has_text('human readable time.N days ago'))
				return text('human readable time.N days ago').replace('N', количество_суток)
			
			return количество_суток + '-' + number_ending(количество_суток, { вопрос: 'чем', число: 'множественное' }) + ' сутками ранее'
		}
			
		количество_суток++
	}
	
	var недели = Math.floor(точные_сутки / 7)
	if (недели < 1.5)
		return text('human readable time.a week ago')
		
	if (недели < 2.5)
		return text('human readable time.2 weeks ago')
		
	if (недели < 3.5)
		return text('human readable time.3 weeks ago')
		
	var месяцы = Math.floor(точные_сутки / 30)
	if (месяцы < 1.5)
		return text('human readable time.a month ago')

	var количество_месяцев = 2
	while (количество_месяцев <= 5)
	{
		if (last_digit(количество_месяцев) == 1 && количество_месяцев !== 11)
			окончание_единицы_измерения = 'ем'
		else
			окончание_единицы_измерения = 'ами'
			
		if (месяцы < количество_месяцев + 0.5)
		{
			if (has_text('human readable time.N months ago'))
				return text('human readable time.N months ago').replace('N', количество_месяцев)
			
			return количество_месяцев + '-' + number_ending(количество_месяцев, { вопрос: 'чем', род: 'мужской' }) + ' месяц' + окончание_единицы_измерения + ' ранее'
		}
			
		количество_месяцев++
	}
	
	годы = Math.floor(точные_сутки / 365.2425)
	if (годы < 0.75)
		return text('human readable time.half a year ago')
		
	if (годы < 1.25)
		return text('human readable time.a year ago')
		
	if (годы < 1.75)
		if (has_text('human readable time.one and a half years ago'))
			return text('human readable time.one and a half years ago')
		
	var количество_лет = 2
	while (количество_лет < 1000000)
	{
		if (last_digit(количество_лет) == 1 && количество_лет !== 11)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (годы < количество_лет + 0.5)
		{
			if (has_text('human readable time.N years ago'))
				return text('human readable time.N years ago').replace('N', количество_лет)
			
			return количество_лет + '-' + number_ending(количество_лет, { вопрос: 'чем', род: 'мужской' }) + ' год' + окончание_единицы_измерения + ' ранее'
		}
			
		количество_лет++
	}
	
	error('Ошибка вычисления времени')
}

function number_ending(число, настройки)
{
	//if (число > 9)
		//число = last_digit(число)
	
	switch (настройки.вопрос)
	{
		case 'чем':
			if (число > 10 && число < 20)
				return 'ю'

			switch (last_digit(число))
			{
				case 0:
					return 'ю'
				case 1:
					if (настройки.род === 'мужской')
					{
						if (настройки.число === 'множественное')
							return 'ими'
						return 'им'
					}
					else
						return 'ой'
				case 2:
				case 3:
				case 4:
					return 'мя'
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
					return 'ю'
			}
	}
}

function last_digit(число)
{
	return число % 10
}

function get_hash()
{
  var hash = decodeURIComponent(window.location.hash)
  return hash.substring(1)
}

function parse_dates(where, property)
{
	where.for_each(function()
	{
		parse_date(this, property)
	})
}

function parse_date(where, property)
{
	if (!where[property])
		return
	
	where[property] = new Date(where[property])
}

function update_intelligent_dates()
{
	var now = new Date().getTime()
	
	$('.intelligent_date').each(function()
	{
		var element = $(this)
		
		if (!element.attr('date'))
			return
		
		var date = new Number(element.attr('date'))
		
		var updated_at_value = element.attr('updated_at')
		if (!updated_at_value)
			updated_at = now
		else
			updated_at = new Number(updated_at_value)
	
		element.text(неточное_время(date + (now - updated_at), { blank_if_just_now: true }))
		element.attr('updated_at', now)
	})
}

function get_image(url, callback)
{
	var image = new Image()
	
	image.onload = function()
	{
		callback({ image: this })
	}
	
	image.onerror = function()
	{
		callback({ error: true })
	}
	
	image.src = url
}

function get_image_size(url, callback)
{
	get_image(url, function(result)
	{
		if (result.error)
			return callback({ error: true, width: 0, height: 0 })
			
		callback({ width: result.image.width, height: result.image.height })
	})
}

function image_exists(url, callback)
{
	get_image(url, function(result)
	{
		if (result.error)
			return callback({ error: true })
			
		callback({ ok: true })
	})
}

//get_image_size('http://www.google.com/images/errors/logo_sm.gif, function(size) { alert(size.width + ' x ' + size.height) })

function iterate_removing(array, condition, action)
{
	var count = array.length
	
	var i = 0
	while (i < count)
	{
		if (condition(array[i]))
		{
			action(array.splice(i, 1)[0])
			count--
		}
		else
			i++
	}
}

function match_url(url, start, patterns, options)
{
	if (url === '')
		return

	if (typeof start !== 'string')
	{
		options = patterns
		patterns = start
		start = ''
	}
	
	options = options || {}

	if (start === '/')
		start = ''
	else if (!url.starts_with(start))
		return
		
	url = url.substring(start.length)
	
	var matched = false
	Object.each(patterns, function(action, key)
	{
		if (matched)
			return
			
		if (key === '*')
		{
			var slash = url.indexOf('/')
			var rest
			
			if (slash < 0)
			{
				slash = url.length
				rest = ''
			}
			else
			{
				rest = url.substring(slash + 1)
			}
			
			matched = true
			return action(decodeURIComponent(url.substring(0, slash)), rest)
		}
		
		if (url.starts_with(key))
		{
			matched = true
			return action(url.substring(key.length + 1))
		}
	})
	
	if (!matched)
		if (options.no_match)
			return options.no_match()
}

function center_list(list, options)
{
	if (list.css('position') !== 'relative')
	{
		throw 'centered list position must be relative'
	}
	
	function calculate_width(count)
	{
		return count * (options.item_width + (options.side_margin * 2))
	}
	
	var margins = parseInt(list.css('margin-left')) + parseInt(list.css('margin-right'))
	var available_width = parseInt(options.space.width())
	
	var count = 0
	var width = 0
	var suitable_width = width
	while (true)
	{
		count++
		width = calculate_width(count) + margins
		
		if (width <= available_width)
			suitable_width = width - margins
		else
			break
	}
	
	list.width(suitable_width)
	
	var left_shift = (available_width - margins - suitable_width) / 2
	
	list.css
	({
		left: left_shift + 'px',
		//'margin-right': parseInt(list.css('margin-right')) - left_shift + 'px' // breaks on resize
	})
}

function click_link(link)
{
    var cancelled = false;

    if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initMouseEvent("click", true, true, window,
            0, 0, 0, 0, 0,
            false, false, false, false,
            0, null);
        cancelled = !link.dispatchEvent(event);
    }
    else if (link.fireEvent) {
        cancelled = !link.fireEvent("onclick");
    }

    if (!cancelled) {
        window.location = link.href;
    }
}

function new_tab(url)
{
	return window.open(url,'_blank','menubar=yes,toolbar=yes,location=yes,directories=yes,fullscreen=no,titlebar=yes,hotkeys=yes,status=yes,scrollbars=yes,resizable=yes')
}

function inscribe(options)
{
	var factor = 1
	
	function propose_factor(new_factor)
	{
		if (new_factor < factor)
			factor = new_factor
	}
	
	propose_factor(options.max_width / options.width)
	propose_factor(options.max_height / options.height)
	
	if (factor === 1 && options.expand)
	{
		factor = options.max_width / options.width
		propose_factor(options.max_height / options.height)
	}
	
	var result =
	{
		width: parseInt(options.width * factor),
		height: parseInt(options.height * factor)
	}
	
	return result
}

var Map = function()
{
	this.store = {}
	
	this.get = function(key)
	{
		return this.store[key]
	}
	
	this.set = function(key, value)
	{
		this.store[key] = value
	}
	
	this.has = function(key)
	{
		return typeof this.get(key) !== 'undefined'
	}
	
	this.for_each = function(action)
	{
		Object.for_each(this.store, function(key, value)
		{
			action(value)
		})
	}
}

function set_version(url, version)
{
	var data = Uri.parse(url)
	
	//if (typeof data.parameters.version === 'undefined')
	data.parameters.version = version
	
	return Uri.assemble(data)
}

function get_version(url)
{
	return Uri.parse(url).parameters.version
}

function download(url)
{
	var iframe = document.getElementById("hiddenDownloader")
	
	if (iframe === null)
	{
		iframe = document.createElement('iframe')
		iframe.id = "hiddenDownloader"
		
		iframe.width = 0
		iframe.height = 0
		iframe.style.visibility = 'hidden'
		iframe.style.display = 'none'
		
		document.body.appendChild(iframe)
	}
	
	iframe.src = url
}

function возраст(birth_date)
{
	var now = new Date()
	
	var years = now.getFullYear() - birth_date.getFullYear() - 1
	
	if (now.getMonth() >= birth_date.getMonth())
		if (now.getDay() >= birth_date.getDay())
			years++
			
	function years_noun()
	{
		switch (last_digit(years))
		{
			case 0:
				return 'лет'
			case 1:
				return 'год'
			case 2:
			case 3:
			case 4:
				return 'года'
			case 5:
			case 6:
			case 7:
			case 8:
			case 9:
				return 'лет'
		}
	}
	
	return years + ' ' + years_noun()
}

function go_to(url)
{
	if (url.starts_with('/') && can_navigate_to_page)
	{
		return navigate_to_page(url, { set_new_url: true })
	}
	
	window.location = url
}

function refresh_page()
{
	go_to(Uri.parse(window.location).to_relative_url())
}

function load_template(url, name, callback)
{
	options.Ajax.get(url, {}, { type: 'html' })
	.ошибка(function()
	{
		throw 'Не удалось загрузить шаблон'
	})
	.ok(function(template) 
	{
		$.compile_template(name, template)
		callback()
	})
}

function page_error(text)
{
	var error_block = $('<div/>').addClass('error').text(text)
	$('#page').empty().append(error_block)
}

// copied from enginex.conf
var Page_url_patterns =
[
	/^\/$/
]

function page_url_pattern(url)
{
	if (!url.starts_with('/'))
		url = text(url)
		
	Page_url_patterns.add(new RegExp('^\\' + url + '(\/(.*))?$'))
}

page_url_pattern('url.network')
page_url_pattern('url.error')
page_url_pattern('url.login required')
page_url_pattern('url.registration')
		
function correct_url(url)
{
	var corrected = is_external_internal_url(url)
	
	if (corrected)
		url = corrected
		
	return url
}

function is_external_internal_url(url)
{
	var url_parts = Uri.parse(url)
	var here_parts = Uri.parse()
	
	if (url_parts.protocol === here_parts.protocol 
		&& url_parts.host === here_parts.host 
		&& url_parts.port === here_parts.port)
	{
		delete url_parts.host
		return Uri.assemble(url_parts)
	}
}

function is_internal_url(url)
{
	return url.starts_with('/')
}

function ajaxify_internal_links(where)
{
	if (!where)
		where = $('body')
		
	where.find('a').each(function()
	{
		var link = $(this)
		var url = link.attr('href')
		
		if (!url)
			return
		
		if (is_external_internal_url(url))
		{
			url = is_external_internal_url(url)
			link.attr('href', url)
		}
		
		if (!is_internal_url(url))
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
			
		link.on('click', function(event)
		{
			if (event.button || event.ctrlKey || event.metaKey)
				return
				
			event.preventDefault()
			
			if (link.attr('inactive_in_edit_mode'))
			{
				if (Режим.правка_ли())
					return
			}
			
			//if ('/' + путь_страницы() === url)
			//	return
			
			go_to(link.attr('href'))
		})
		
		link.data('ajaxified', true)
	})
}

function проверить_доступ(uri)
{
	if (uri === Url_map.network || uri.starts_with(Url_map.network + '/'))
	{
		if (!$.cookie('user'))
		{
			go_to(text('url.login required') + '?' + 'url' + '=' + encodeURI(uri))
			return false
		}
	}
	
	return true
}

Array.prototype.swap = function(a, b)
{
	var temporary = this[a]
	this[a] = this[b]
	this[b] = temporary
}

var Quick_sort = new Class
({
	Implements: [Options],
	
	options:
	{
		value: function(array, index)
		{
			return array[index]
		}
	},
	
	initialize: function(options)
	{
		this.setOptions(options)
	},
	
	// The partitioning function scans an array segment array
	// from element begin to element end,
	// and moves all elements that are less than the pivot value
	// to the beginning of the array
	partition: function(array, begin, end, pivot)
	{
		var pivot_value = this.options.value(array, pivot)
		
		// move pivot to end
		array.swap(pivot, end)
		
		var store_smaller_ones_at = begin
		
		var index = begin
		while (index < end)
		{
			if (this.options.value(array, index) <= pivot_value)
			{
				array.swap(store_smaller_ones_at, index)
				store_smaller_ones_at++
			}
			
			index++
		}
		
		pivot = store_smaller_ones_at
		
		// move pivot to its final place
		array.swap(end, pivot)
	
		// new pivot index
		return pivot
	},
	
	sort: function(array, begin, end)
	{
		// default behaviour is to sort the whole array
		if (typeof begin === 'undefined')
		{
			begin = 0
			end = array.length - 1
		}
		
		if (end <= begin)
			return
		
		var pivot = begin + Math.floor(Math.random() * (end - begin + 1))
	
		pivot = this.partition(array, begin, end, pivot)
	
		this.sort(array, begin, pivot - 1)
		this.sort(array, pivot + 1, end)
	}
})

function по_порядку(array)
{
	if (array.is_empty())
		return
	
	new Quick_sort
	({
		value: function(array, index)
		{
			return array[index].порядок
		}
	})
	.sort(array)
}

/*
// test sorting by order
var test_data = [{ name: 'lalala', порядок: 1000 }, { name: 'aaa', порядок: 55 }, { name: 'ooo', порядок: 200 }, { name: 'ccc', порядок: 201 }, { name: 'xyz', порядок: 0 }]
по_порядку(test_data)
console.log(test_data)
*/

function left_mouse_button(event)
{
	return event.which === 1
}

var User_online_status = new Class
({
	Binds: ['update_online_status'],
	
	initialize: function(id_card)
	{
		this.id_card = id_card
	},
	
	show: function(когда_был_здесь)
	{
		if (!когда_был_здесь)
			return
		
		//if (когда_был_здесь.constructor !== 'Date')
		//	когда_был_здесь = new Date(когда_был_здесь)
		
		this.когда_был_здесь = когда_был_здесь
		
		this.id_card.find('.last_action_time')
			.attr('date', this.когда_был_здесь.getTime())
			.addClass('intelligent_date')
			.text(неточное_время(this.когда_был_здесь))
		
		var maximum_opacity = this.id_card.find('.was_here').css('opacity')
		
		var online_status = this.id_card.find('.online_status')
		
		online_status.on('mouseenter', (function()
		{
			this.id_card.find('.was_here').fade_in(0.3, { maximum_opacity: maximum_opacity, hide: true })
		})
		.bind(this))
		
		online_status.on('mouseleave', (function()
		{
			this.id_card.find('.was_here').fade_out(0.3)
		})
		.bind(this))
		
		this.launch_online_status_updater()
	},

	launch_online_status_updater: function()
	{
		var status = this.id_card.find('.online_status')
			
		this.online_status =
		{
			online: status.find('> .online'),
			
			recent: status.find('> .recent'),
			offline: status.find('> .offline') 
		}
		
		page.ticking(this.update_online_status, 5 * 1000)
	},
	
	update_online_status: function()
	{
		var секунд_прошло = (new Date().getTime() - this.когда_был_здесь.getTime()) / 1000
		
		// 24h offline testing
		//секунд_прошло = 60 * 60 * 24
		
		var горячесть = Math.pow(1.000005, -секунд_прошло)
		
		var precision = 1000
		горячесть = Math.round(горячесть * precision) / precision
		
		var остылость_свечения = секунд_прошло / Configuration.User_is_online_for
		if (остылость_свечения > 1)
			остылость_свечения = 1
		
		this.online_status.online.css({ opacity: 1 - остылость_свечения })
		
		this.online_status.recent.css({ opacity: горячесть })
		this.online_status.offline.css({ opacity: 1 - горячесть })
	}
})

function is_node_editable(node)
{
	if (node.getAttribute('contenteditable') == 'true')
		return true

	if (node instanceof HTMLDocument)
		return false

	if (!(node.parentNode instanceof HTMLDocument))
		return is_node_editable(node.parentNode)
}

function is_node_untabbable(node)
{
	if (node.getAttribute('untabbable') == 'true')
		return true
}

function Countdown(count, callback)
{
	function is_done()
	{
		if (count === 0)
		{
			callback()
			return true
		}
	}
	
	if (is_done())
		return
	
	return function()
	{
		count--
		is_done()
	}
}

function trim_element(element)
{
	function is_br(node)
	{
		return !Dom_tools.is_text_node(node) && $(node).is('br')
	}
	
	function remove(node)
	{
		element.node().removeChild(node)
	}
	
	function remove_brs(generator)
	{
		var node = element.node()[generator]
		
		if (is_br(node))
		{
			remove(node)
			remove_brs(generator)
		}
	}
	
	function remove_whitespace_characters(generator, trimmer)
	{
		var node = element.node()[generator]
		
		if (!Dom_tools.is_text_node(node))
			return
		
		if (node.nodeValue.is_empty())
			return
		
		trimmer(node, trimmer)
	}
	
	if (element.node().childNodes.length === 0)
		return
	
	// delete all leading <br/>s
	remove_brs('firstChild')
	
	// delete all leading whitespace characters
	
	remove_whitespace_characters('firstChild', function(node, itself)
	{
		if (/\s/.test(node.nodeValue.first()))
		{
			node.nodeValue = node.nodeValue.substring(1)
			return itself(node, itself)
		}
	})
	
	// delete all trailing <br/>s
	remove_brs('lastChild')
	
	// delete all trailing whitespace characters
	
	remove_whitespace_characters('lastChild', function(node, itself)
	{
		if (/\s/.test(node.nodeValue.last()))
		{
			node.nodeValue = node.nodeValue.substring(0, node.nodeValue.length - 1)
			return itself(node, itself)
		}
	})
}

function users_autocomplete(element, options)
{
	return element.autocomplete
	({
		mininum_query_length: 3,
		search: function(query, callback)
		{
			var ajax = page.Ajax.get('/люди/поиск',
			{
				query: query,
				max: 5
			})
			.ok(function(data)
			{
				callback(data.люди)
			})
									
			var search =
			{
				cancel: function()
				{
					ajax.abort()
				}
			}
			
			return search
		},
		decorate: function(человек)
		{
			if (человек.avatar_version)
			{
				var icon = $('<div/>')
					.addClass('icon')
					.css('background-image', 'url("/загруженное/люди/' + человек.id + '/картинка/мелкая.jpg?version=' + человек.avatar_version + '")')
					.appendTo(this)
			}
			
			$('<div/>')
				.addClass('title')
				.text(человек.имя)
				.appendTo(this)
		},
		value: function(человек)
		{
			return человек._id + ''
		},
		title: function(человек)
		{
			return человек.имя
		},
		choice: options.choice,
		nothing_found: options.nothing_found,
		required: options.required
	})
}