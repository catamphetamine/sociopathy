var Ajax = 
{
	get: function(url, data, options)
	{
		if (!options)
		{
			options = data
			data = undefined
		}
		
		this.request('GET', url, data, options);
	},
	
	post: function(url, data, options)
	{
		this.request('POST', url, data, options);
	},
	
	put: function(url, data, options)
	{
		this.request('POST', url, Object.merge(data, { _method: 'put' }), options);
	},
	
	request: function(method, url, data, options)
	{
		options.type = options.type || 'json'
		
		options.ошибка = options.ошибка || 'Ошибка связи с сервером'
		options.error = options.error || function(message) { error(message) }
		
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
					options.error(json.ошибка)
					return
				}

				if (typeof(options.ok) === 'function')
					options.ok(json)
				else if (typeof(options.ok) === 'string')
					info(options.ok)
				else
					error('Неправильная настройка ok: ' + ok)
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				options.error(options.ошибка)
			},
			dataType: options.type,
			
			beforeSend: function() { disable_links() },
			complete: function() { enable_links() },
			timeout: 15000
		})
	}
}

function disable_links()
{
	$('a').each(function()
	{
		if ($(this).attr('href'))
			$(this).data('href', $(this).attr('href')).removeAttr('href');
	})
}

function enable_links()
{
	$('a').each(function()
	{
		$(this).attr('href', $(this).data('href'));
	})
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
	var сейчас = new Date()
	var разница = (сейчас.getTime() - Date.parse(время).getTime()) / 1000
	
	var окончание_единицы_измерения
	
	if (разница < 0)
		return время
	
	var минуты = разница / 60
	if (минуты < 1)
		return "только что"
		
	if (минуты <= 25)
	{
		if (last_digit(минуты) == 1)
			окончание_единицы_измерения = 'ой'
		else
			окончание_единицы_измерения = 'ами'
		
		return минуты + '-' + number_ending(минуты, { вопрос: 'чем', род: 'женский' }) + ' минут' + окончание_единицы_измерения + ' ранее'
	}
	
	var часы = минуты / 60
	if (часы < 0.75)
		return 'получасом ранее'
		
	if (часы < 1.25)
		return 'часом ранее'
		
	if (часы < 1.75)
		return 'полутора часами ранее'
	
	var количество_часов = 2
	while (количество_часов <= 23)
	{
		if (last_digit(количество_часов) == 1)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (часы < количество_часов + 0.5)
			return количество_часов + '-' + number_ending(количество_часов, { вопрос: 'чем', род: 'мужской' }) + ' час' + окончание_единицы_измерения + ' ранее'
			
		количество_часов++
	}
	
	var сутки = часы / 24
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
	
	var недели = сутки / 7
	if (недели < 1.5)
		return 'на прошлой неделе'
		
	if (недели < 2.5)
		return 'на позапрошлой неделе'
		
	if (недели < 3.5)
		return '3-мя неделями ранее'
		
	var месяцы = сутки / 30
	if (месяцы < 1.5)
		return 'в прошлом месяце'

	if (месяцы < 2.5)
		return 'в позапрошлом месяце'

	var количество_месяцев = 3
	while (количество_месяцев <= 5)
	{
		if (last_digit(количество_месяцев) == 1)
			окончание_единицы_измерения = 'ем'
		else
			окончание_единицы_измерения = 'ами'
			
		if (месяцы < количество_месяцев + 0.5)
			return количество_месяцев + '-' + number_ending(количество_месяцев, { вопрос: 'чем', род: 'мужской' }) + ' месяц' + окончание_единицы_измерения + ' ранее'
			
		количество_месяцев++
	}
	
	годы = сутки / 365.2425
	if (годы < 0.75)
		return 'полугодом ранее'
		
	if (годы < 1.25)
		return 'годом ранее'
		
	if (годы < 1.75)
		return 'полутора годами ранее'
		
	var количество_лет = 2
	while (количество_лет < 1000000)
	{
		if (last_digit(количество_лет) == 1)
			окончание_единицы_измерения = 'ом'
		else
			окончание_единицы_измерения = 'ами'
			
		if (годы < количество_лет + 0.5)
			return количество_лет + '-' + number_ending(количество_лет, { вопрос: 'чем' }) + ' год' + окончание_единицы_измерения + ' ранее'
			
		количество_лет++
	}
	
	error('Ошибка вычисления времени')
}

function number_ending(число, настройки)
{
	if (число > 9)
		число = last_digit(число)
	
	switch (настройки.вопрос)
	{
		case 'чем':
			switch (число)
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
				case 9:
					return 'ю'
			}
	}
}

function last_digit(число)
{
	return число % 10
}