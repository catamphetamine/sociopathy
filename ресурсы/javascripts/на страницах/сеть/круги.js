title('Круги')

//Режим.пообещать('правка')
//Режим.пообещать('действия')

function initialize_page()
{
	var conditional = initialize_conditional($('.main_conditional[type=conditional]'))
	
	new Data_templater
	({
		template_url: '/страницы/кусочки/круг в списке кругов.html',
		item_container: $('#circles'),
		postprocess_element: function(item)
		{
			return $('<li/>').append(item)
		},
		conditional: conditional
	},
	new  Data_loader
	({
		url: '/приложение/пользователь/круги',
		before_done_output: circles_loaded,
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
//	Режим.разрешить('правка')
//	Режим.разрешить('действия')
}
