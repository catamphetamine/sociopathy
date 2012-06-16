(function()
{
	page.query('#entry', 'entry')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/запись в дневнике.html',
			container: page.entry,
			conditional: conditional,
			loader: new  Data_loader
			({
				url: '/приложение/человек/дневник/запись',
				parameters: { запись: page.data.запись },
				before_done: entry_loaded,
				get_data: function(data)
				{
					title(data.запись.название + '. ' + 'Дневник. ' + page.data.пользователь_сети['адресное имя'])

					parse_date(data.запись, 'когда')
					return data.запись
				}
			})
		})
	}
	
	function entry_loaded()
	{
		$(document).trigger('page_initialized')
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()