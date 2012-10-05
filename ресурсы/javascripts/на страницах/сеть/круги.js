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
			to: $('#circles'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/сеть/круги',
			done: page.initialized,
			before_done: circles_loaded,
			get_data: function(data)
			{
				var круги = []
			
				data.круги.for_each(function()
				{
					круги.push({ название: this.круг, члены: this.члены })
				})
				
				return круги
			}
		}))
	}
	
	function circles_loaded()
	{
	//	Режим.разрешить('правка')
	//	Режим.разрешить('действия')
	}
})()