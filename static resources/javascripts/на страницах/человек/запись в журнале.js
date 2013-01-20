(function()
{
	page.query('#entry', 'entry')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
	
		new Data_templater
		({
			template_url: '/страницы/кусочки/запись в журнале.html',
			container: page.entry,
			conditional: conditional,
			loader: new  Data_loader
			({
				url: '/приложение/человек/журнал/запись',
				parameters: { запись: page.data.запись },
				before_done: entry_loaded,
				done: page.initialized,
				get_data: function(data)
				{
					title(data.запись.название + '. ' + 'Журнал. ' + page.data.пользователь_сети['адресное имя'])

					breadcrumbs
					([
						{ title: data.запись.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
						{ title: 'Журнал', link: '/люди/' + page.data.адресное_имя + '/журнал' },
						{}
					])
		
					parse_date(data.запись, 'когда')
					return data.запись
				}
			})
		})
	}
	
	function entry_loaded()
	{
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
})()