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
			url = correct_internal_url(url)
		
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
		
		if (window.development_mode)
			jQuery_options.cache = false
		
		if (options.jQuery)
			$.extend(jQuery_options, options.jQuery)
			
		var ajax = $.ajax(jQuery_options)
		
		result.abort = function() { ajax.abort() }
		
		var default_on_error = function(сообщение)
		{
			error('Ошибка связи с сервером')
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
function неточное_время(время)
{
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
		return "только что"
		
	if (минуты <= 25)
	{
		if (last_digit(минуты) == 1 && минуты !== 11)
			окончание_единицы_измерения = 'ой'
		else
			окончание_единицы_измерения = 'ами'
		
		return минуты + '-' + number_ending(минуты, { вопрос: 'чем', род: 'женский' }) + ' минут' + окончание_единицы_измерения + ' ранее'
	}
	
	var точные_часы = точные_минуты / 60
	var часы = Math.floor(точные_часы)
	if (часы < 0.75)
		return 'получасом ранее'
		
	if (часы < 1.25)
		return 'часом ранее'
		
	if (часы < 1.75)
		return 'полутора часами ранее'
	
	var количество_часов = 2
	while (количество_часов <= 23)
	{
		if (last_digit(количество_часов) == 1 && количество_часов !== 11)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (часы < количество_часов + 0.5)
			return количество_часов + '-' + number_ending(количество_часов, { вопрос: 'чем', род: 'мужской' }) + ' час' + окончание_единицы_измерения + ' ранее'
			
		количество_часов++
	}
	
	var точные_сутки = точные_часы / 24
	var сутки = Math.floor(точные_сутки)
	if (сутки < 1.5)
		return 'вчера'
		
	if (сутки < 2.5)
		return 'позавчера'
		
	var количество_суток = 3
	while (количество_суток <= 6)
	{
		if (сутки < количество_суток + 0.5)
			return количество_суток + '-' + number_ending(количество_суток, { вопрос: 'чем', число: 'множественное' }) + ' сутками ранее'
			
		количество_суток++
	}
	
	var недели = Math.floor(точные_сутки / 7)
	if (недели < 1.5)
		return 'на прошлой неделе'
		
	if (недели < 2.5)
		return 'на позапрошлой неделе'
		
	if (недели < 3.5)
		return '3-мя неделями ранее'
		
	var месяцы = Math.floor(точные_сутки / 30)
	if (месяцы < 1.5)
		return 'в прошлом месяце'

	if (месяцы < 2.5)
		return 'в позапрошлом месяце'

	var количество_месяцев = 3
	while (количество_месяцев <= 5)
	{
		if (last_digit(количество_месяцев) == 1 && количество_месяцев !== 11)
			окончание_единицы_измерения = 'ем'
		else
			окончание_единицы_измерения = 'ами'
			
		if (месяцы < количество_месяцев + 0.5)
			return количество_месяцев + '-' + number_ending(количество_месяцев, { вопрос: 'чем', род: 'мужской' }) + ' месяц' + окончание_единицы_измерения + ' ранее'
			
		количество_месяцев++
	}
	
	годы = Math.floor(точные_сутки / 365.2425)
	if (годы < 0.75)
		return 'полугодом ранее'
		
	if (годы < 1.25)
		return 'годом ранее'
		
	if (годы < 1.75)
		return 'полутора годами ранее'
		
	var количество_лет = 2
	while (количество_лет < 1000000)
	{
		if (last_digit(количество_лет) == 1 && количество_лет !== 11)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (годы < количество_лет + 0.5)
			return количество_лет + '-' + number_ending(количество_лет, { вопрос: 'чем', род: 'мужской' }) + ' год' + окончание_единицы_измерения + ' ранее'
			
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
							return 'ними'
						return 'ним'
					}
					else
						return 'ной'
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
	
		element.text(неточное_время(date + (now - updated_at)))
		element.attr('updated_at', now)
	})
}

/*
function получить_шаблон(options, callback)
{
	Ajax.get(options.url, {}, { type: 'html' })
	.ошибка(function()
	{
		if (options.error)
			return options.error('Не удалось загрузить страницу')
			
		error('Не удалось загрузить страницу')
	})
	.ok(function(template) 
	{
		$.template(options.id, template)
		
		callback()
	})
}
*/

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
		return count * (options.item_width + (options.item_margin * 2))
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
		return navigate_to_page(url,
		{
			before: function() { set_new_url(url) }
		})
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
		$.template(name, template)
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
	/^\/$/,
	/^\/люди(\/(.*))?$/,
	/^\/читальня(\/(.*))?$/,
	/^\/помощь(\/(.*))?$/,
	/^\/сеть\/((.*))?$/,
	/^\/ошибка(\/(.*))?$/,
	/^\/требуется вход(\/(.*))?$/,
]

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
	if (uri === '/сеть' || uri.starts_with('/сеть/'))
	{
		if (!$.cookie('user'))
		{
			go_to('/требуется вход' + '?' + 'url' + '=' + encodeURI(uri))
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