var panel_menu = $('#panel_menu')
$('#extra_panel_menu li').each(function()
{
	panel_menu.append(this)
})
$('#extra_panel_menu').remove()

$(document).on('authenticated', function(event, data)
{
	//if (!first_time_page_loading)
	//	return
	
	if (!data.новости)
		return
	
	if (data.новости.новости)
		Новости.новости(data.новости.новости)
		//panel.new_news({ immediate: true })
	
	if (data.новости.беседы)
		Новости.беседы(data.новости.беседы)
		//panel.new_messages({ immediate: true })
	
	if (data.новости.обсуждения)
		Новости.обсуждения(data.новости.обсуждения)
		//panel.new_discussions({ immediate: true })
		
	if (data.новости.болталка)
		Новости.болталка(data.новости.болталка)
})

$(document).on('display_page', function()
{
	if (доступна_ли_страница_управления())
	{
		panel.buttons.управление.element.parent().css('display', 'inline-block')
		//panel.buttons.управление.tooltip.update_position()
	}
	
	if (есть_ли_полномочия('управляющий'))
	{
		panel.buttons.ошибки.element.parent().css('display', 'inline-block')
	}
})

function доступна_ли_страница_управления()
{
	return есть_ли_полномочия('управляющий') || есть_ли_полномочия('приглашения')
}