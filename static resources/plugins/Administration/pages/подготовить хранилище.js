(function()
{
	title(text('pages.administration.initialize.title'))
	
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
		
		page.Ajax.get('/хранилище/создано ли')
		.ok(function(data)
		{
			if (data.создано)
			{
				page.get('.initialize').hide()
				page.get('.already_initialized').show()
			}
			
			page.content_ready()
		})
	}
})()