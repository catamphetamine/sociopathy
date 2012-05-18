(function()
{
	title('Круги')
	
	//Режим.пообещать('правка')
	//Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/круг в списке кругов.html',
			container: $('#circles'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/пользователь/круги',
			before_done: circles_loaded,
			get_data: function(data)
			{
				var круги = []
			
				Object.each(data.круги, function(value, key)
				{
					круги.push({ название: key, члены: value })
				})
				
				return круги
			}
		}))
	}
	
	function circles_loaded()
	{
		$(document).trigger('page_initialized')
		
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
	
	page.needs_initializing = true
})()