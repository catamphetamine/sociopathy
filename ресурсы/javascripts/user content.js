var panel_menu = $('#panel_menu')
$('#extra_panel_menu li').each(function()
{
	panel_menu.append(this)
})
$('#extra_panel_menu').remove()

$(document).on('page_loaded', function()
{
	if (!first_time_page_loading)
		return
		
	if (!Страница.is('новости'))
		if (пользователь.новости.есть_новые_новости)
			panel.new_news({ immediate: true })
		
	if (!Страница.is('беседы'))
		if (пользователь.беседы.есть_новые_сообщения)
			panel.new_messages({ immediate: true })
		
	if (!Страница.is('обсуждения'))
		if (пользователь.обсуждения.есть_новые_новости)
			panel.new_discussions({ immediate: true })
})

$(document).on('display_page', function()
{
	if (пользователь && пользователь.управляющий)
	{
		panel.buttons.управление.element.parent().show()
		panel.buttons.управление.tooltip.update_position()
	}
})