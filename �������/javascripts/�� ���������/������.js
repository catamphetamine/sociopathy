/**
 * Welcome page initialization
 */

var enter_window
var кнопка_отмены
var кнопка_входа

// create dialog
function initialize_enter_window()
{
	enter_window = $("#enter_window").dialog_window
	({
		'close on escape': true,
		'on open': function() { $('#enter_window input:first').focus() }
	})
	
	enter_window.register_controls
	(
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
	.does(function() { войти() })
}

function activate_button(selector, options)
{
	var element = $(selector)

	options = options || {}
	options.selector = selector

	return button.physics.classic(new text_button
	(
		element,
		Object.append
		(
			{
				skin: 'sociopathy',
				
				// miscellaneous
				'button type':  element.attr('type'), // || 'generic',
			},
			options
		)
	))
}
        
$(function()
{
    $('.registration_hint .actions .enter').click(function(event)
    {
        event.preventDefault()
        enter_window.open()
    })

    initialize_enter_window()
    initialize_enter_window_buttons()
})

function войти(data)
{
	loading_indicator.show()
	Ajax.put('/приложение/вход', data, 
	{ 
		error: 'Не удалось войти', 
		ok: function(данные)
		{ 
			loading_indicator.hide()
			enter_window.close()
			Message.info('Ваше имя: ' + данные) 
		} 
	})
}