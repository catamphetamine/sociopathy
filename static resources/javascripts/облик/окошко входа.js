var enter_window

var войти

function выйти()
{
	var loading = loading_indicator.show()
	page.Ajax.post('/выход')
	.ошибка(function(ошибка)
	{
		loading.hide()
		error(ошибка)
	})
	.ok(function(данные)
	{ 
		loading.hide()
		loading_page({ full: true }, function()
		{
			window.location = '/'
		})
	})
}

(function()
{
	var кнопка_отмены
	var кнопка_входа
	
	var login_form
	
	var поле_имени
	var поле_пароля
		
	// create dialog
	function initialize_enter_window()
	{
		enter_window = $("#enter_window").dialog_window
		({
			'close on escape': true,
			'on open': function() { $('#enter_window input:first').focus() }
		})
		
		поле_имени = enter_window.content.find('input').eq(0)
		поле_пароля = enter_window.content.find('input').eq(1)
		
		enter_window.on_enter = function()
		{
			кнопка_входа.push()
		}
		
		login_form = new Form(enter_window.content.find('form').eq(0))
		
		кнопка_отмены = new text_button('#enter_window .buttons .cancel', { 'prevent double submission': true })
		.does(function() { enter_window.close() })	
		
		кнопка_входа = new text_button('#enter_window .buttons .enter', { 'prevent double submission': true })
		.does(function() { войти({ имя: поле_имени.val(), пароль: поле_пароля.val() }) }).submits(login_form)
		
		enter_window.register_controls
		(
			login_form,
			кнопка_отмены,
			кнопка_входа
		)
		
		/*
		$(document).on('keydown', function(event)
		{
			if (Клавиши.поймано(Настройки.Клавиши.Вход, event))
				if (!пользователь)
					enter_window.open()
		})
		*/
		
		$('.enter').on('click', function(event)
		{
			event.preventDefault()
			
			if (!пользователь)
				enter_window.open()
		})
		
		$('.logout').on('click', function(event)
		{
			event.preventDefault()
			выйти()
		})
	}
	
	function проверить_адрес_на_вход()
	{
		if (!пользователь)
			if (get_hash() === "войти")
				enter_window.open()
	}
	
	$(document).on('page_initialized', function()
	{
		if (first_time_page_loading)
			initialize_enter_window()
		
		проверить_адрес_на_вход()
		//window.onhashchange = проверить_адрес_на_вход
	})

	войти = function(data)
	{
		var loading = loading_indicator.show()
		page.Ajax.post('/приложение/вход', data)
		.ошибка(function(ошибка)
		{
			loading.hide()
			
			if (ошибка == 'log in.error.user not found')
				поле_имени.focus()
			if (ошибка == 'log in.error.incorrect password')
				поле_пароля.focus()
			
			error(text(ошибка))
				
			кнопка_входа.unlock({ force: true })
		})
		.ok(function(данные)
		{
			loading.hide()
			loading_page({ full: true }, function()
			{
				enter_window.close()
				
				if (data.go_to)
					return window.location = data.go_to
				
				if (page.data.go_to_after_login)
					return window.location = page.data.go_to_after_login
					
				reload_web_page()
			})
		})
	}
})()