(function()
{
	title('Настройки')
	
	Режим.пообещать('правка')
	Подсказки.подсказка('Здесь вы можете посмотреть и изменить свои настройки. Пока это только личный почтовый ящик.')
		
	var email
	var No_email_text
	
	page.load = function()
	{
		email = $('#content').find('.email')
		No_email_text = email.text()
	
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_loader
		({
			url: '/приложение/сеть/пользователь/настройки',
			callback: conditional.callback,
			show: show_settings,
		})
		.load()
	}
	
	function show_settings(настройки)
	{
		if (настройки.почта)
			email.text(настройки.почта)
		
		$('.shortcuts').find('> ul').each(function()
		{
			var category = $(this)
			category.find('> li').each(function()
			{
				var key = $(this)
				
				var directory = Настройки.Клавиши
				
				if (category.attr('path') != "Прочее")
					directory = directory[category.attr('path')]
				
				key.find('> span').text(directory[key.attr('path')].join(', ')).attr('editable', true)
			})
		})
		
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
		var mail = email.text()
		if (mail !== No_email_text)
			return mail
		return
	}
	
	function новые_клавиши()
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
				
			category.find('> li').each(function()
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
		var клавиши = новые_клавиши()
		
		if (!клавиши)
			return Режим.ошибка_правки()
		
		var почта = get_email()
		
		Режим.save_changes_to_server
		({
			anything_changed: function()
			{
				return true
			},
			
			data:
			{
				почта: почта,
				клавиши: JSON.stringify(клавиши)
			},
			
			url: '/приложение/сеть/пользователь/настройки',
			
			ok: function()
			{
				if (почта && почта !== page.data.старая_почта)
					info('На ваш новый почтовый ящик отправлено письмо')
			}
		})
	}
	
	page.needs_initializing = true
})()