(function()
{
	title(text('pages.administration.initialize.title'))

	page.needs_initializing = false
	
	page.load = function()
	{
		page.get('button').on('click', function()
		{
			var administrator = JSON.parse(page.get('.data').html())
			
			$(this).attr('disabled', true)
			
			page.Ajax.post('/хранилище/создать', { administrator: JSON.stringify(administrator) })
			.ok(function()
			{
				go_to('/?войти=true')
			})
		})
	}
})()