var Validation = {}

Validation.прописка =
{
	имя: function(имя, callback)
	{
		имя = имя.trim()
		
		if (!имя)
			return callback({ error: 'Вам нужно представиться' })
			
		if (!isNaN(parseInt(имя[0])))
			return callback({ error: 'Имя не может начинаться с цифры' })
			
		var form = this
			
		page.Ajax.get('/приложение/человек/по имени',
		{
			имя: имя
		})
		.ok(function()
		{
			callback({ error: 'Это имя уже занято' })
		})
		.ошибка(function(error, options)
		{
			if (options.data.не_найден)
				return callback()
			
			callback({ error: error })
		})
	},
	
	пол: function(пол, callback)
	{
		if (!пол)
			return callback({ error: 'Вам нужно указать свой пол' })
			
		callback()
	},
	
	откуда: function(откуда, callback)
	{
		откуда = откуда.trim()
		
		if (!откуда)
			return callback({ error: 'Даже Neverland сойдёт' })
		
		callback()
	},
	
	почта: function(почта, callback)
	{
		почта = почта.trim()
		
		if (!почта)
			return callback({ error: 'Ваша почта нам пригодится' })
		
		var form = this
			
		page.Ajax.get('/приложение/человек/по почте',
		{
			почта: почта
		})
		.ok(function(data)
		{
			callback({ error: 'Это почта пользователя ' + data.имя, bubble: true })
		})
		.ошибка(function(error, options)
		{
			if (options.data.не_найден)
				return callback()
			
			callback({ error: error })
		})
	},
	
	пароль: function(пароль, callback)
	{
		if (!пароль)
			return callback({ error: 'Пароль будет нужен для входа' })
			
		callback()
	}
}

Validation.беседа = 
{
	добавить_пользователя: function(value, callback)
	{
		value = value.trim()
		
		if (!value)
			return callback({ error: 'Укажите имя пользователя' })
			
		var form = this
			
		page.Ajax.get('/приложение/человек/по имени',
		{
			имя: value
		})
		.ok(function(data)
		{
			form.user = data
			callback()
		})
		.ошибка(function(error)
		{
			callback({ error: error })
		})
	}
}

function проверить_ссылку_на_раздел(url, options, callback)
{
	if (!url)
		return callback({ error: 'Вставьте ссылку на раздел, \nв который будет перенесён этот раздел' })
		
	url = Uri.parse(url).to_relative_url()
	var here = Uri.parse(window.location).to_relative_url()
	
	if (url === here)
		return callback({ error: 'Нельзя перенести раздел в самого себя' })
	
	if (url.indexOf(here) === 0)
		return callback({ error: 'Нельзя перенести раздел в его же подраздел' })

	if (!url.starts_with('/читальня'))
		return callback({ error: 'Это не адрес раздела читальни' })
	
	var путь = url.substring('/читальня'.length)
	
	var form = this
	
	if (путь == '')
	{
		if (options.ошибка_если_корень)
			return callback({ error: options.ошибка_если_корень })
		
		form.раздел = null
		return callback()
	}
	
	if (путь.starts_with('/'))
		путь = путь.substring('/'.length)
		
	page.Ajax.get('/приложение/раздел или заметка', { путь: путь })
	.ошибка(function(ошибка, options)
	{
		return callback({ error: ошибка })
	})
	.ok(function(данные) 
	{
		if (данные.заметка)
			return callback({ error: 'Это адрес заметки, а не раздела' })
		
		form.раздел = данные.раздел
		
		callback()
	})
}

Validation.читальня =
{
	ссылка_на_раздел: function(url, callback)
	{
		проверить_ссылку_на_раздел.bind(this)(url, {}, callback)
	},
	
	ссылка_на_раздел_для_заметки: function(url, callback)
	{
		проверить_ссылку_на_раздел.bind(this)(url, { ошибка_если_корень: 'Нельзя переносить заметки в корень читальни' }, callback)
	}
}

Validation.книги =
{
	название: function(название, callback)
	{
		if (название.length === 0)
			return callback({ error: 'Укажите название книги' })
			
		callback()
	},
	
	сочинитель: function(сочинитель, callback)
	{
		if (сочинитель.length === 0)
			return callback({ error: 'Укажите сочинителя книги' })
			
		callback()
	}
}

Validation.вход =
{
	имя: function(имя, callback)
	{
		if (имя.length == 0)
			return callback({ error: 'Введите ваше имя' })
			
		callback()
	},
	
	пароль: function(пароль, callback)
	{
		if (пароль.length == 0)
			return callback({ error: 'Введите ваш пароль' })
			
		callback()
	}
}

Validation.наглядный_писарь = {}

Validation.наглядный_писарь.видео = function(value, callback)
{
	if (!value)
		return callback({ error: 'Вставьте ссылку на видео' })
		
	if (!Youtube.Video.id(value) && !Vimeo.Video.id(value))
		return callback({ error: 'Не получается вставить это видео' })
		
	callback()
}

Validation.наглядный_писарь.source = function(value, callback)
{
	try
	{
		Wiki_processor.validate(value)
	}
	catch (error)
	{
		callback({ error: get_error_message(error) })
		if (error.explanation)
			warning(error.explanation)
		return
	}
		
	if (!value)
		return callback({ error: 'Введите код xml' })
						
	callback()
}

Validation.наглядный_писарь.формула = function(value, callback)
{
	if (!value)
		return callback({ error: 'Введите код формулы в формате TeX' })
		
	callback()
}

Validation.наглядный_писарь.картинка = function(url, callback)
{
	if (!url)
		return callback({ error: 'Введите адрес картинки' })
		
	image_exists(url, function(result)
	{
		if (result.error)
			return callback({ error: 'Картинка не найдена' })
		
		callback()
	})
}
				
Validation.наглядный_писарь.ссылка = function(value, callback)
{
	if (!value)
		return callback({ error: 'Введите адрес ссылки' })
		
	callback()
}

Validation.наглядный_писарь.аудиозапись =
{
	ссылка: function(value, callback)
	{
		if (!value)
			return callback({ error: 'Вставьте ссылку на аудиозапись' })
		
		callback()
	},
	
	название: function(value, callback)
	{
		if (!value)
			return callback({ error: 'Введите название аудиозаписи' })
		
		callback()
	}
}