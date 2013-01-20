var Подсказки = (function()
{
	var включены = false
	
	$(function()
	{
		$(document).keydown(function(event) 
		{
			if (Клавиши.is(Настройки.Клавиши.Подсказки, event))
			{
				// disable hints
				return
				
				включены = !включены
				if (включены)
				{
					if (подсказка)
						info(подсказка)
					else
						info('Пока нет подсказок')
				}
			}
		})
	})				

	var подсказка
	
	var назначить_подсказку = function(сообщение)
	{
		if (включены)
			if (сообщение)
				info(сообщение)

		var предыдущая_подсказка = подсказка
		подсказка = сообщение
		return предыдущая_подсказка
	}
	
	var дополнить_подсказку = function(дополнение)
	{
		подсказка += '\n\n' + дополнение
	}
	
	var запомненные_подсказки = {}
	var запомнить = function(название)
	{
		запомненные_подсказки[название] = подсказка
	}
	
	var возстановить = function(название)
	{
		return запомненные_подсказки[название]
	}

	var result =
	{
		подсказка: назначить_подсказку,
		ещё_подсказка: дополнить_подсказку,
		запомнить: запомнить,
		возстановить: возстановить
	}
	
	return result
})()

function Подсказка(id, текст)
{
	if (!пользователь)
		return
	
	if (пользователь.session.не_показывать_подсказки.has(id))
		return
	
	info(текст, { postprocess: function(container)
	{
		var dismiss = $('<a/>').css('float', 'right').attr('href', '#').text('Больше не напоминать об этом').click(function(event)
		{
			event.preventDefault()
			Ajax.delete('/приложение/сеть/подсказка', { подсказка: id }).ok(function() { container.trigger('contextmenu') })
		})
		
		$('<br/>').appendTo(this)
		$('<br/>').appendTo(this)
		dismiss.appendTo(this)
		$('<div style="clear: both"/>').appendTo(this)
	},
	sticky: false })
}