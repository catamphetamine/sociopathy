url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Administration'
	
	match_url(url,
	{
		'сеть/управление': function(rest)
		{
			tools.page('управление')
		}
	})
})

$(document).on('display_page', function()
{
	if (доступна_ли_страница_управления())
	{
		panel.buttons.Administration.element.parent().css('display', 'inline-block')
		//panel.buttons.управление.tooltip.update_position()
	}
})

function доступна_ли_страница_управления()
{
	return есть_ли_полномочия('управляющий') || есть_ли_полномочия('приглашения')
}