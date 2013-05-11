title(text('pages.circles.title'));

(function()
{
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })
		
		new Data_templater
		({
			template: 'круг в списке кругов',
			to: $('#circles'),
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/сеть/круги',
			done: page.content_ready,
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