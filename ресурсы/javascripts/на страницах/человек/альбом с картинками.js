title(window.альбом + '. ' + 'Картинки. ' + адресное_имя)

Режим.пообещать('правка')
Режим.пообещать('действия')

function initialize_page()
{
	var conditional = initialize_conditional($('.main_conditional[type=conditional]'))
	
	breadcrumbs
	([
		{ title: адресное_имя, link: '/люди/' + адресное_имя },
		{ title: 'Картинки', link: '/люди/' + адресное_имя + '/картинки' },
		{ title: альбом, link: '/люди/' + адресное_имя + '/картинки/' + альбом }
	],
	function()
	{
		new Data_templater
		({
			template_url: '/страницы/кусочки/картинка в альбоме.html',
			item_container: $('#pictures'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: $('.main_conditional[type=conditional]')
		},
		new  Data_loader
		({
			url: '/приложение/человек/картинки/альбом',
			parameters: { адресное_имя: window.адресное_имя, альбом: window.альбом },
			before_done_output: pictures_loaded,
			get_data: function(data) { return data.картинки }
		}))
	
		$(window).resize(center_pictures_list)
		center_pictures_list()
		
		//$('#content').disableTextSelect()
	},
	function() { conditional.callback('Не удалось получить данные') })
}

function center_pictures_list()
{
	center_list($('#pictures'), { space: $('#content'), item_width: 400, item_margin: 40 })
}

function pictures_loaded()
{
	Режим.разрешить('правка')
	Режим.разрешить('действия')
}
