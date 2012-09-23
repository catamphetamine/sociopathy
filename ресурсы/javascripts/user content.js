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

function есть_ли_полномочия(какие)
{
	return пользователь && пользователь.полномочия && пользователь.полномочия.contains(какие)
}

$(document).on('display_page', function()
{
	if (доступна_ли_страница_управления())
	{
		panel.buttons.управление.element.parent().css('display', 'inline-block')
		//panel.buttons.управление.tooltip.update_position()
	}
})

function доступна_ли_страница_управления()
{
	return есть_ли_полномочия('управляющий') || есть_ли_полномочия('приглашения')
}