/**
 * Welcome page initialization
 */

var enter_window

var поле_имени
var поле_пароля
var кнопка_отмены
var кнопка_входа

var login_form

// create dialog
function initialize_enter_window()
{
	enter_window = $("#enter_window").dialog_window
	({
		'close on escape': true,
		'on open': function() { $('#enter_window input:first').focus() }
	})
	
	поле_имени = enter_window.$element.find('input').eq(0)
	поле_пароля = enter_window.$element.find('input').eq(1)
	
	enter_window.on_enter = function()
	{
		кнопка_входа.push()
	}
	
	login_form = new Form(enter_window.$element.find('form').eq(0))
	
	enter_window.register_controls
	(
		login_form,
		кнопка_отмены,
		кнопка_входа
	)
}

// create dialog buttons
function initialize_enter_window_buttons()
{
	кнопка_отмены = activate_button('#enter_window .buttons .cancel', { 'prevent double submission': true })
	.does(function() { enter_window.close() })
	
	кнопка_входа = activate_button('#enter_window .buttons .enter', { 'prevent double submission': true })
	.does(function() { войти({ имя: поле_имени.val(), пароль: поле_пароля.val() }) }).submits(login_form)
}
        
$(document).on('fully_loaded', function()
{
    initialize_enter_window()
    initialize_enter_window_buttons()
	
	function проверить_адрес_на_вход()
	{
		if (!пользователь)
			if (get_hash() === "войти")
				enter_window.open()
	}
	
	проверить_адрес_на_вход()
	//window.onhashchange = проверить_адрес_на_вход
	
	$('.enter').live('click', function(event)
	{
		event.preventDefault()
		
		if (!пользователь)
			enter_window.open()
	})
		
	$('.logout').click(function(event)
	{
		event.preventDefault()
		выйти()
	})
})

function войти(data)
{
	loading_indicator.show()
	Ajax.post('/приложение/вход', data, 
	{
		ошибка: 'Не удалось войти',
		ошибка: function(ошибка)
		{
			loading_indicator.hide()
			error(ошибка)
			поле_пароля.focus()
			кнопка_входа.unlock({ force: true })
		},
		ok: function(данные)
		{ 
			loading_indicator.hide()
			enter_window.close()
			
			window.location.reload()
		} 
	})
}

function выйти()
{
	loading_indicator.show()
	Ajax.post('/приложение/выход', {}, 
	{
		ошибка: 'Не удалось выйти',
		ошибка: function(ошибка)
		{
			loading_indicator.hide()
			error(ошибка)
		},
		ok: function(данные)
		{ 
			loading_indicator.hide()
			//window.location.reload()
			window.location = '/'
		} 
	})
}

Validation.вход =
{
	имя: function(имя)
	{
		if (имя.length == 0)
			throw new custom_error('Введите ваше имя')
	},
	
	пароль: function(пароль)
	{
		if (пароль.length == 0)
			throw new custom_error('Введите ваш пароль')
	}
}