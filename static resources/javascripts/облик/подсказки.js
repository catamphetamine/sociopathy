var Подсказки =
{
	закрыть: function(id)
	{
		// close popup
		$('.popup_panel[hint="' + id + '"]').trigger('click')
	}
}

function Подсказка(id, текст, options)
{
	options = options || {}
	
	if (!пользователь)
		return
	
	if (пользователь.session.не_показывать_подсказки.has(id))
		return
	
	var already_shown = false
	$('.popup_panel[hint="' + id + '"]').each(function()
	{
		if (!$(this).attr('closing'))
			already_shown = true
	})
	
	if (already_shown)
		return
	
	info(текст, { postprocess: function(container)
	{
		var dismiss = $('<a/>').css('float', 'right').attr('href', '#').text('Больше не напоминать об этом').click(function(event)
		{
			event.preventDefault()
			Ajax.delete('/приложение/сеть/подсказка', { подсказка: id }).ok(function()
			{
				// close popup
				container.trigger('click')
			})
		})
		
		$('<br/>').appendTo(this)
		$('<br/>').appendTo(this)
		dismiss.appendTo(this)
		$('<div style="clear: both"/>').appendTo(this)
		
		this.attr('hint', id)
	},
	on_vanish: options.on_vanish,
	sticky: false })
	
	return true
}