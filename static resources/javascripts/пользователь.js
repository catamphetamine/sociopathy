var Пользовательские_настройки_по_умолчанию =
{
	Клавиши:
	{
		Режимы:
		{
			Обычный: ['Alt', 'Shift', '1'],
			Правка: ['Alt', 'Shift', '2'],
			Действия: ['Alt', 'Shift', '3']
		},
		Действия:
		{
			Создать: ['Ctrl', 'Alt', 'N'],
			Добавить: ['Ctrl', 'Alt', 'A'],
			Удалить: ['Ctrl', 'Alt', 'Backspace']
		},
		Писарь:
		{
			Разрывный_пробел: ['Ctrl', 'Shift', 'Пробел'],
			Показать: ['Пробел']
		},
		Вход: ['Ctrl', 'Alt', 'L'],
		Подсказки: ['Alt', 'Shift', '0']
	}
}

var Настройки = Пользовательские_настройки_по_умолчанию

var пользователь = null
var данные_пользователя = {}

;(function()
{
	function apply_shortcut_synonyms()
	{
		//Настройки.Клавиши.Действия.Добавить = Настройки.Клавиши.Действия.Создать
	}
		
	apply_shortcut_synonyms()
		
	function применить_пользовательские_настройки(настройки)
	{
		Настройки = {}
		
		Object.x_over_y(Пользовательские_настройки_по_умолчанию, Настройки)
		Object.x_over_y(настройки.клавиши, Настройки.Клавиши)
	
		if (настройки.язык)
			Настройки.Язык = настройки.язык
		
		apply_shortcut_synonyms()
	}
	
	function получить_данные_пользователя(возврат)
	{
		$.ajax('/приложение/данные пользователя')
		.error(function(ошибка)
		{
			alert('Ошибка при загрузке страницы')
			console.error('User data not loaded')
		})
		.success(function(данные) 
		{
			if (данные.ошибка)
			{
				// если кука user - кривая, то она уже сама удалилась на сервере
				if (данные.ошибка === 'Пользователь не найден')
				{
					//alert('Пользователь не опознан')
					console.error('Пользователь не опознан')
					//go_to('/')
					return возврат()
				}
				else
				{
					alert('Ошибка при загрузке страницы')
					console.error(данные.ошибка)
					console.error('User data not loaded')
					return
				}
			}
				
			window.данные_пользователя = данные
			
			пользователь = данные.пользователь
			
			//пользователь.versioning = window.versioning.пользователь
			
			if (!пользователь && Страница.эта().starts_with('сеть/'))
				window.location = '/прописка'
					
			//$(document).trigger('authenticated', данные)
			user_authenticated(данные)
			
			возврат()
		})
	}
	
	//$(document).on('authenticated', function(event, данные)
	function user_authenticated(данные)
	{
		if (данные.session.настройки)
			применить_пользовательские_настройки(данные.session.настройки)
		
		пользователь.session = {}
		пользователь.session.не_показывать_подсказки = данные.session.не_показывать_подсказки || []
		
		if (Настройки.Язык)
		{
			// сменить язык на выбранный
			if (Настройки.Язык !== Configuration.Locale.Предпочитаемый_язык)
			{
				Configuration.Locale.Предпочитаемый_язык = Настройки.Язык
				
				Configuration.Locale.Предпочитаемые_языки.remove(Настройки.Язык)
				Configuration.Locale.Предпочитаемые_языки.unshift(Настройки.Язык)
			}
		}
	}
	
	function finished()
	{
		initial_script_in_progress.finished('пользователь')
	}
			
	if ($.cookie('user'))
		получить_данные_пользователя(finished)
	else
		finished()
})()