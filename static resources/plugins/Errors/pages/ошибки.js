(function()
{
	title(text('pages.errors.title'))

	page.query('.errors', 'errors')
	
	page.load_data
	({
		url: '/приложение/сеть/ошибки',
		batch_size: 10,
		data: function(data)
		{
			data.ошибки.for_each(function()
			{
				parse_date(this, 'когда')
				this.когда_примерно = неточное_время(this.когда, { blank_if_just_now: true })
			})
			
			return data.ошибки
		}
	})
	
	page.load = function()
	{
		page.подсказка('ошибки', 'Здесь показываются ошибки, которые происходят у всех пользователей сети')
	}
	
	page.data_container = 'errors'
	
	page.data_templater_options = function()
	{
		var options =
		{
			template: 'ошибки',
			to: page.errors,
			table: true
		}
		
		return options
	}
	
	page.data_loader.options.before_done = function(содержимое)
	{
		if (содержимое.пусто())
		{
			page.get('.empty').show()
		}
		else
		{
			page.get('.errors').show()
			page.get('.errors').find('th').disableTextSelect()
		}
	}
})()