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
	
	var container = video.find('.container')
	
	video.find('.previous').on('click', function(event) 
	{
		var previous_video_icon = current_video_icon.parent().prev().children().eq(0)
		if (!previous_video_icon.exists())
			return hide_video()
		
		container.empty()
		show_video_file(previous_video_icon)
	})
	
	video.find('.next').on('click', function(event) 
	{
		var next_video_icon = current_video_icon.parent().next().children().eq(0)
		if (!next_video_icon.exists())
			return hide_video()
		
		container.empty()
		show_video_file(next_video_icon)
	})
	
	var current_video_icon
	
	function show_video_file(image)
	{
		current_video_icon = image
		
		var code = ''
		
		if (image.attr('vimeo_video_id'))
			code = Vimeo.Video.embed_code(image.attr('vimeo_video_id'))
		else if (image.attr('youtube_video_id'))
			code = Youtube.Video.embed_code(image.attr('youtube_video_id'))
		
		container.empty().append($(code))
		
		show_video()
	}
	
	content.find('.video').click(function(event)
	{
		event.preventDefault()
		
		show_video_file($(this))
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
		
		video.find('.close').on('click' + namespace, function(event) 
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