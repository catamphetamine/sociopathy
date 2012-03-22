var panel_menu = $('#panel_menu')
$('#extra_panel_menu li').each(function()
{
	panel_menu.append(this)
})

$(document).on('styles_loaded', function()
{
	if (пользователь.новости.есть_новые_новости)
		panel.new_news({ immediate: true })
		
	if (пользователь.беседы.есть_новые_сообщения)
		panel.new_messages({ immediate: true })
		
	if (пользователь.обсуждения.есть_новые_новости)
		panel.new_discussions({ immediate: true })	
})