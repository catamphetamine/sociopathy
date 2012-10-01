Подсказка('изменение настроек', 'Вы можете изменить настройки, перейдя в <a href=\'/помощь/режимы#Режим правки\'>«режим правки»</a>');

(function()
{
	title('Настройки')
	
	Режим.пообещать('правка')
	Подсказки.подсказка('Здесь вы можете посмотреть и изменить свои настройки. Пока это только личный почтовый ящик.')
		
	page.query('.email', 'email')
	
	var No_email_text
	
	page.load = function()
	{
		No_email_text = page.email.text()
	
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_loader
		({
			url: '/приложение/сеть/пользователь/настройки',
			callback: conditional.callback,
			done: settings_loaded,
		})
		.load()
	}
	
	function settings_loaded(настройки)
	{
		page.data.настройки = настройки[0]
		
		подготовить_режим_правки()
		
		Режим.activate_edit_actions({ on_save: save_changes })
		Режим.разрешить('правка')
		
		$(document).trigger('page_initialized')
	}
	
	function подготовить_режим_правки()
	{
		$(document).on_page('режим.правка', function(event)
		{
			page.data.старая_почта = get_email()
		})
	
		initialize_edit_mode_effects()	
	}
	
	function initialize_edit_mode_effects()
	{
		initialize_body_edit_mode_effects()
	}
	
	function get_email()
	{
		var mail = page.email.text()
		if (mail !== No_email_text)
			return mail
		return
	}
	
	function считать_клавиши()
	{
		var новые_клавиши = {}
				
		var клавиша_не_опознана = false
		
		$('.shortcuts').find('> ul').each(function()
		{
			var category = $(this)
		
			var directory = новые_клавиши
			if (category.attr('path') != "Прочее")
			{
				новые_клавиши[category.attr('path')] = {}
				directory = directory[category.attr('path')]
			}
				
			category.find('> li[path]').each(function()
			{
				var key = $(this)
				
				var keys = key.find('> span').text().split(',')._map(function() { return this.trim() })
				keys.for_each(function()
				{
					if (this != 'Command' && this != 'Ctrl' && this != 'Alt' && this != 'Shift')
						if (typeof Клавиши[this] !== 'number')
							клавиша_не_опознана = this
				})
				
				directory[key.attr('path')] = keys
			})
		})
		
		if (клавиша_не_опознана)
		{
			warning('Клавиша «' + клавиша_не_опознана + '» не опознана')
			return false
		}
		
		return новые_клавиши
	}
	
	function save_changes()
	{
		var данные = page.Data_store.collect()
		
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				return true
			},
			
			data:
			{
				почта: данные.почта,
				клавиши: JSON.stringify(данные.клавиши)
			},
			
			url: '/приложение/сеть/пользователь/настройки',
			
			ok: function()
			{
				//if (данные.почта && данные.почта !== page.data.старая_почта)
				//	info('На ваш новый почтовый ящик (возможно) было отправлено письмо (а возможно и не было отправлено)')
			}
		})
	}
	
	page.Data_store.collect = function()
	{
		var result = {}
		
		result.почта = get_email()
		result.клавиши = считать_клавиши()
		
		return result
	}
	
	page.Data_store.populate = function(data)
	{
		if (data.почта)
			page.email.text(data.почта)
		
		$('.shortcuts').find('> ul').each(function()
		{
			var category = $(this)
			category.find('> li[path]').each(function()
			{
				var key = $(this)
				
				var directory = data.клавиши
				
				if (category.attr('path') != "Прочее")
					directory = directory[category.attr('path')]
				
				key.find('> span').text(directory[key.attr('path')].join(', ')).attr('editable', true)
			})
		})
	}
	
	page.Data_store.deduce = function()
	{
		var result =
		{
			почта: page.data.настройки.почта,
			клавиши: Настройки.Клавиши
		}
		
		return result
	}

	page.Data_store.что = 'настройки пользователя'
	
	page.needs_initializing = true
})()