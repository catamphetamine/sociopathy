// internationalization
$.i18n.setLocale("ru")

// show error message on error

//$.ajaxError(show_error_message)

// dialog windows

function open_window(window)
{
	// open the dialog window
	window.dialog('open')
}

function close_window(window)
{
	// reset rolled over buttons
	text_button_fader.for_each(function() { button_fader.kill_focus($(this)) }, { parent: window })
	
	// close the dialog window
	window.dialog('close')
}
