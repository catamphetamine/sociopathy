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
			url: '/приложение/пользователь/настройки',
			callback: conditional.callback,
			show: show_settings,
		})
		.load()
	}
	
	function show_settings(настройки)
	{
		if (настройки.почта)
			email.text(настройки.почта)
		
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
	
	function save_changes()
	{
		Режим.заморозить_переходы()
		var загрузка = loading_indicator.show()
	
		var почта = get_email()
			
		page.Ajax.post('/приложение/пользователь/настройки',
		{
			почта: почта
		})
		.ошибка(function(ошибка)
		{
			загрузка.hide()
			Режим.разрешить_переходы()
			
			error(ошибка)
		})
		.ok(function()
		{
			if (почта && почта !== page.data.старая_почта)
				info('На ваш новый почтовый ящик отправлено письмо')
			загрузка.hide()
			Режим.разрешить_переходы()
			Режим.изменения_сохранены()
		})
	}
	
	page.needs_initializing = true
})()