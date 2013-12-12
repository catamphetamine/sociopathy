var Validation = {}

Validation.прописка =
{
	имя: function(имя, callback)
	{
		имя = имя.trim()
		
		if (!имя)
			return callback({ error: text('pages.main.registration.error.choose a name') })
			
		if (!isNaN(parseInt(имя[0])))
			return callback({ error: text("pages.main.registration.error.a name can't start with a digit") })
			
		var form = this
			
		page.Ajax.get('/приложение/человек/по имени',
		{
			имя: имя
		})
		.ok(function()
		{
			callback({ error: text('pages.main.registration.error.name already reserved') })
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
			return callback({ error: text('pages.main.registration.error.tell us your gender') })
			
		callback()
	},
	
	откуда: function(откуда, callback)
	{
		откуда = откуда.trim()
		
		if (!откуда)
			return callback({ error: text('pages.main.registration.error.tell us your origin') })
		
		callback()
	},
	
	почта: function(почта, callback)
	{
		почта = почта.trim()
		
		if (!почта)
			return callback({ error: text('pages.main.registration.error.tell us your email') })
		
		var form = this
			
		page.Ajax.get('/приложение/человек/по почте',
		{
			почта: почта
		})
		.ok(function(data)
		{
			callback({ error: text('pages.main.registration.error.email already used', { user: data.имя }), bubble: true })
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
			return callback({ error: text('pages.main.registration.error.choose a password') })
			
		callback()
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

	if (!url.starts_with(text('pages.library.url')))
		return callback({ error: 'Это не адрес раздела архива' })
	
	var путь = url.substring(text('pages.library.url').length)
	
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
		if (ошибка === 'not found')
			ошибка = 'Раздел или заметка «' + путь + '» не найдены'
			
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
		проверить_ссылку_на_раздел.bind(this)(url, { ошибка_если_корень: 'Нельзя переносить заметки в корень архива' }, callback)
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
		
	Smart_parser.проверить_ссылку(value, function(valid)
	{
		if (!valid)
			return callback({ error: 'Ссылка недоступна' })
		
		callback()
	})
}

Validation.наглядный_писарь.аудиозапись =
{
	ссылка: function(value, callback)
	{
		if (!value)
			return callback({ error: 'Вставьте ссылку на аудиозапись' })
		
		if (value.contains('.vk.me/'))
		{
			warning('Ссылка на аудиозапись из Вконтакта «живёт» очень мало. Это защита Вконтакта от таких людей, как мы. Поэтому аудиозапись перестанет проигрываться уже через некоторое время.')
			//return callback({ error: 'Ссылки из Вконтакта не будут работать' })
		}
		
		callback()
	},
	
	название: function(value, callback)
	{
		if (!value)
			return callback({ error: 'Введите название аудиозаписи' })
		
		callback()
	}
}

Validation.книга =
{
	название: function(название, callback)
	{
		название = название.trim()
		
		if (!название)
			return callback({ error: 'Введите название книги' })
			
		callback()
	},
	
	сочинитель: function(сочинитель, callback)
	{
		сочинитель = сочинитель.trim()
		
		if (!сочинитель)
			return callback({ error: 'Укажите автора книги' })
			
		callback()
	}
}