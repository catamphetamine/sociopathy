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
	Vimeo.load_pictures()
	Youtube.load_pictures()
	
	var video = $('.show_video')
	var namespace = '.show_video'
	
	$('a.video').click(function(event)
	{
		event.preventDefault()
		
		var image = $(this).find('img')
		var code = ''
		
		if (image.attr('vimeo_video_id'))
			code = Vimeo.Video.embed_code(image.attr('vimeo_video_id'))
		else if (image.attr('youtube_video_id'))
			code = Youtube.Video.embed_code(image.attr('youtube_video_id'))
		
		video.find('.container').empty().append($(code))
		
		show_video()
	})
	
	function hide_video()
	{
		$(document).unbind(namespace)
		video.unbind(namespace)
		video.fade_out(0.0)
	}
	
	function show_video()
	{
		video.fade_in(0.3, function() { video.focus() })
	
		$(document).on('keydown' + namespace, function(event) 
		{
			if (Клавиши.is('Escape', event))
				hide_video()
		})
		
		video.on('click' + namespace, function(event) 
		{
			hide_video()
		})
	}
	
	/*
	video.find('.close').click(function(event)
	{
		event.preventDefault()
		hide_video()
	})
	*/

	Режим.разрешить('правка')
	Режим.разрешить('действия')
}