title(window.альбом + '. ' + 'Видео. ' + адресное_имя)

Режим.пообещать('правка')
Режим.пообещать('действия')

function initialize_page()
{
	var conditional = initialize_conditional($('.main_conditional[type=conditional]'))
	
	breadcrumbs
	([
		{ title: адресное_имя, link: '/люди/' + адресное_имя },
		{ title: 'Видео', link: '/люди/' + адресное_имя + '/видео' },
		{ title: альбом, link: '/люди/' + адресное_имя + '/видео/' + альбом }
	],
	function()
	{
		new Data_templater
		({
			template_url: '/страницы/кусочки/видео в альбоме.html',
			item_container: $('#videos'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/приложение/человек/видео/альбом',
			parameters: { адресное_имя: window.адресное_имя, альбом: window.альбом },
			before_done_output: videos_loaded,
			get_data: function(data) { return data.видео }
		}))
	
		$(window).resize(center_videos_list)
		center_videos_list()
		
		//$('#content').disableTextSelect()
	},
	function() { conditional.callback('Не удалось получить данные') })
}

function center_videos_list()
{
	center_list($('#videos'), { space: $('#content'), item_width: Options.Video.Size.Width, item_margin: 40 })
}

function videos_loaded()
{
	Режим.разрешить('правка')
	Режим.разрешить('действия')
}
