var Пользовательские_настройки_по_умолчанию =
{
	Клавиши: Hotkeys
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
	
		// пока не даём возможности сменить язык, т.к. он теперь един для всего сайта
		//if (настройки.язык)
		//	Настройки.Язык = настройки.язык
		
		apply_shortcut_synonyms()
	}
	
	function получить_данные_пользователя(возврат)
	{
		данные = window.user_data
	
		if (данные.error)
		{
			if (данные.error === 'user.not authenticated')
			{
				// гость
				return возврат()
			}
			// если кука user - кривая, то она уже сама удалилась на сервере
			else if (данные.error === 'user.invalid authentication token')
			{
				console.error('Пользователь не опознан')
				return возврат()
			}
			else
			{
				alert('Ошибка при опознании пользователя')
				console.error(данные.error)
				console.error('User data not loaded')
				return
			}
		}
				
		window.данные_пользователя = данные
		
		пользователь = данные.пользователь
				
		user_authenticated(данные)
		
		возврат()
	}
	
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