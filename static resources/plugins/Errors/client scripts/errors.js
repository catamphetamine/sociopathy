url_matcher(function(url)
{
	var tools = this
	
	tools.id = 'Errors'

	match_url(url,
	{
		'сеть/ошибки': function(rest)
		{
			tools.page('ошибки')
		}
	})
})

$(document).on('display_page', function()
{
	if (есть_ли_полномочия('управляющий'))
	{
		panel.buttons.Errors.element.parent().css('display', 'inline-block')
	}
})