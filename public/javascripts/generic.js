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
	// close the dialog window
	window.dialog('close')
	
	window.reset()
}
