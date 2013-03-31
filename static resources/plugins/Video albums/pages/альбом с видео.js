(function()
{
	title(page.data.альбом + '. ' + text('pages.video albums.title'))
	
	//Режим.пообещать('правка')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		new Data_templater
		({
			template: 'видео в альбоме',
			container: $('#videos'),
			conditional: conditional
		},
		new  Data_loader
		({
			url: '/человек/видео/альбом',
			parameters: { 'адресное имя': page.data.адресное_имя, альбом: page.data.альбом },
			before_done: videos_loaded,
			done: function()
			{
				page.initialized()
				center_videos_list()
			},
			get_data: function(data)
			{
				title(page.data.альбом + '. ' + text('pages.video albums.title') + '. ' + data.пользователь.имя)
	
				if (data.альбом.описание)
				{
					$('#videos').before($('<p/>').addClass('description').text(data.альбом.описание))
				}
				
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: '/люди/' + page.data.адресное_имя },
					{ title: text('pages.video albums.title'), link: '/люди/' + page.data.адресное_имя + '/видео' },
					{ title: data.альбом.название, link: '/люди/' + page.data.адресное_имя + '/видео/' + page.data.альбом }
				])
				
				return data.альбом.видео
			}
			}))
		
		$(window).on_page('resize.videos', center_videos_list)
	}

	var scroll_navigation
		
	page.unload = function()
	{
		if (scroll_navigation)
			scroll_navigation.deactivate()
	}
	
	function center_videos_list()
	{
		center_list($('#videos'), { space: page.content, item_width: Configuration.Video.Icon.Size.Width + 2 /* border */, item_margin: 40 })
	}
	
	function videos_loaded()
	{
		Vimeo.load_pictures()
		Youtube.load_pictures()
		
		var video = $('.show_video')
		var namespace = '.show_video'
		
		var container = video.find('.container')
		
		function previous_video(options)
		{
			options = options || {}
			
			var previous_video_icon = current_video_icon.parent().prev().children().eq(0)
			if (!previous_video_icon.exists())
				if (options.dont_close)
					return false
				else
					return hide_video()
			
			container.empty()
			show_video_file(previous_video_icon)
		}
	
		video.find('.previous').on('click', function(event) 
		{
			previous_video()
		})
		
		function next_video(options)
		{
			options = options || {}
			
			var next_video_icon = current_video_icon.parent().next().children().eq(0)
			if (!next_video_icon.exists())
				if (options.dont_close)
					return false
				else
					return hide_video()
			
			container.empty()
			show_video_file(next_video_icon)
		}
		
		video.find('.next').on('click', function(event) 
		{
			next_video()
		})
		
		var current_video_icon
			
		var delta_height = parseInt(container.css('margin-top')) + parseInt(container.css('margin-bottom'))
		var delta_width = parseInt(container.css('margin-left')) + parseInt(container.css('margin-right'))
		
		var all_icons = $('#videos').find('li > img')
		
		function get_video_number()
		{
			var i = 0
			while (i < all_icons.length)
			{
				if (all_icons[i] === current_video_icon[0])
					return i + 1
					
				i++
			}
		}
		
		var progress = new Progress
		({
			element: $('.progress_bar .bar .progress'),
			maximum: all_icons.length
		})
				
		function show_video_file(image, options)
		{
			set_url('/люди/' + page.data.адресное_имя + '/видео/' + page.data.альбом + '/' + image.attr('video_id'))
		
			options = options || {}
		
			current_video_icon = image
		
			video.removeClass('shown')
			container.empty().hide()
		
			var description_height = 0
			if (image.next().is('p'))
			{
				description = $('<p/>').addClass('video_description').text(image.next().text())
				description.appendTo(container)
				description_height = description.outerHeight(true)
			}
		
			var size = inscribe
			({
				width: Configuration.Video.Size.Width,
				height: Configuration.Video.Size.Height,
				max_width: $(window).width() - delta_width,
				max_height: $(window).height() - delta_height - description_height,
				//expand: true // тормозит, т.к. кадры увеличиваются на лету
			})
			
			options.width = size.width
			options.height = size.height
			
			var code = ''
			
			if (image.attr('vimeo_video_id'))
				code = Vimeo.Video.embed_code(image.attr('vimeo_video_id'), options)
			else if (image.attr('youtube_video_id'))
				code = Youtube.Video.embed_code(image.attr('youtube_video_id'), options)
			
			var video_block = $('<div/>').addClass('video').html(code)
			container.prepend(video_block).show()
			
			scroll_navigation.activate(video_block)
			video.addClass('shown')
			
			progress.update(get_video_number())
		}
		
		page.get('.video').click(function(event)
		{
			event.preventDefault()
			
			scroll_navigation = new Scroll_navigation
			({
				previous: previous_video,
				next: next_video,
				previous_fast: function()
				{
					previous_video({ dont_close: true })
				},
				next_fast: function()
				{
					next_video({ dont_close: true })
				}
			})
			
			show_video_file($(this), { play: true })
			show_video()
		})
		
		function hide_video()
		{
			set_url('/люди/' + page.data.адресное_имя + '/видео/' + page.data.альбом)
		
			scroll_navigation.deactivate()
			$(document).unbind(namespace)
			video.unbind(namespace)
			video.fade_out(0)
			$('body').removeClass('no_scrollbar')
			container.empty()
		}
		
		function show_video()
		{
			//scroll_navigation.activate(video.find('.previous'))
			//scroll_navigation.activate(video.find('.next'))
			
			$('body').addClass('no_scrollbar')
			video.fade_in(0.3, function() { video.focus() })
		
			$(document).on_page('keydown' + namespace, function(event) 
			{
				if (Клавиши.is('Escape', event))
					return hide_video()
			
				if (Клавиши.is('Left', event))
					return previous_video()
					
				if (Клавиши.is('Right', event))
					return next_video()
			})
			
			video.find('.close').disableTextSelect().on('click' + namespace, function(event) 
			{
				hide_video()
			})
			
			video.find('.previous').on('contextmenu' + namespace, function(event) 
			{
				event.preventDefault()
				video.find('.close').click()
			})
			
			video.find('.next').on('contextmenu' + namespace, function(event) 
			{
				event.preventDefault()
				video.find('.close').click()
			})
		}
		
		/*
		video.find('.close').click(function(event)
		{
			event.preventDefault()
			hide_video()
		})
		*/
	
		$('#videos').find('> li > [video_id="' + page.data.видеозапись + '"]').click()
		
		//Режим.разрешить('правка')
	}
})()