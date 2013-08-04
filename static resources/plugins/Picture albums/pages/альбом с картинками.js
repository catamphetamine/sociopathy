(function()
{
	title(page.data.альбом + '. ' + text('pages.picture albums.title'))
	
	//Режим.пообещать('правка')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		new Data_templater
		({
			template: 'картинка в альбоме',
			container: $('#pictures'),
			conditional: $('.main_conditional')
		},
		new  Data_loader
		({
			url: '/человек/картинки/альбом',
			parameters: { id: page.data.пользователь_сети.id, альбом: page.data.альбом },
			before_done: pictures_loaded,
			done: function()
			{
				page.content_ready()
				center_pictures_list()
			},
			get_data: function(data)
			{
				title(page.data.альбом + '. ' + text('pages.picture albums.title') + '. ' + data.пользователь.имя)
				
				if (data.альбом.описание)
				{
					$('#pictures').before($('<p/>').addClass('description').text(data.альбом.описание))
				}
				
				breadcrumbs
				([
					{ title: data.пользователь.имя, link: link_to('user', page.data.пользователь_сети.id) },
					{ title: text('pages.picture albums.title'), link: link_to('user.pictures', page.data.пользователь_сети.id) },
					{ title: data.альбом.название, link: link_to('user.pictures.album', page.data.пользователь_сети.id, page.data.альбом) }
				])
				
				return data.альбом.картинки
			}
		}))
	
		$(window).on_page('resize.pictures', center_pictures_list)
	}
	
	function center_pictures_list()
	{
		center_list($('#pictures'), { space: $('#content'), item_width: 400, side_margin: 40 })
	}
	
	var scroll_navigation = new Scroll_navigation()
	
	page.unload = function()
	{
		if (scroll_navigation)
			scroll_navigation.deactivate()
	}
	
	function pictures_loaded()
	{
		var picture = $('.show_picture')
		var namespace = '.show_picture'
		
		var container = picture.find('.container')
		
		function previous_picture(options)
		{
			options = options || {}
			
			var previous_picture_icon = current_picture_icon.parent().prev().children().eq(0)
			if (!previous_picture_icon.exists())
				if (options.dont_close)
					return false
				else
					return hide_picture()
			
			show_picture_file(previous_picture_icon)
		}
		
		picture.find('.previous').on('click', function(event) 
		{
			previous_picture()
		})
		
		function next_picture(options)
		{
			options = options || {}
			
			var next_picture_icon = current_picture_icon.parent().next().children().eq(0)
			if (!next_picture_icon.exists())
				if (options.dont_close)
					return false
				else
					return hide_picture()
			
			show_picture_file(next_picture_icon)
		}
		
		picture.find('.next').on('click', function(event) 
		{
			next_picture()
		})
		
		var current_picture_icon
		
		var delta_height = parseInt(container.css('margin-top')) + parseInt(container.css('margin-bottom'))
		var delta_width = parseInt(container.css('margin-left')) + parseInt(container.css('margin-right'))
		
		var all_icons = $('#pictures').find('li > div')
		
		function get_picture_number()
		{
			var i = 0
			while (i < all_icons.length)
			{
				if (all_icons[i] === current_picture_icon[0])
					return i + 1
					
				i++
			}
		}
		
		var progress = new Progress
		({
			element: $('.progress_bar .bar .progress'),
			maximum: all_icons.length
		})
		
		function show_picture_file(icon)
		{
			set_url(link_to('user.pictures.album', page.data.пользователь_сети.id, page.data.альбом) + '/' + icon.attr('picture_id'))
		
			current_picture_icon = icon
		
			picture.removeClass('shown')
			container.empty().hide()
			
			var description_height = 0
			if (icon.next().is('p'))
			{
				description = $('<p/>').addClass('picture_description').text(icon.next().text())
				description.appendTo(container)
				description_height = description.outerHeight(true)
			}
				
			var url = icon.attr('picture')
			get_image(url, function(result)
			{
				if (result.error)
					return
			
				var image = $(result.image)
				container.find('> .picture').remove()
				container.prepend($('<div/>').addClass('picture').append(image))
	
				var initial_width = result.image.width
				var initial_height = result.image.height
				
				image.on('click', function(event) 
				{
					if (Клавиши.is('Shift', event))
					{
						event.preventDefault()
						return new_tab(image.attr('src'))
					}
					
					event.preventDefault()
					next_picture()
				})
				
				scroll_navigation.activate(image)
				
				var size = inscribe
				({
					width: result.image.width,
					height: result.image.height,
					max_width: $(window).width() - delta_width,
					max_height: $(window).height() - delta_height - description_height
				})
				
				image.width(size.width)
				image.height(size.height)
				
				container.show()
				picture.addClass('shown')
				
				progress.update(get_picture_number())
			})
		}
		
		page.get('.icon').on('click', function(event)
		{
			event.preventDefault()
			
			container.empty()
			
			scroll_navigation = new Scroll_navigation
			({
				previous: previous_picture,
				next: next_picture,
				previous_fast: function()
				{
					previous_picture({ dont_close: true })
				},
				next_fast: function()
				{
					next_picture({ dont_close: true })
				}
			})
			
			show_picture_file($(this))
			show_picture()
		})
		
		function hide_picture()
		{
			set_url(link_to('user.pictures.album', page.data.пользователь_сети.id, page.data.альбом))
		
			scroll_navigation.deactivate()
			$(document).unbind(namespace)
			picture.unbind(namespace)
			picture.fade_out(0)
			$('body').removeClass('no_scrollbar')
		}
		
		function show_picture()
		{
			//scroll_navigation.activate(picture.find('.previous'))
			//scroll_navigation.activate(picture.find('.next'))
			
			$('body').addClass('no_scrollbar')
			picture.fade_in(0, function() { picture.focus() })
		
			$(document).on_page('keydown' + namespace, function(event) 
			{
				if (Клавиши.is('Escape', event))
					return hide_picture()
			
				if (Клавиши.is('Left', event))
					return previous_picture()
					
				if (Клавиши.is('Right', event))
					return next_picture()
					
				if (Клавиши.is('Shift', event))
				{
					container.css('cursor', '-webkit-zoom-in')
					container.css('cursor', '-moz-zoom-in')
					return
				}
			})
			
			$(document).on_page('keyup' + namespace, function(event) 
			{
				//if (Клавиши.is('Shift', event))
				
				container.css('cursor', 'default')
			})
		}
		
		picture.find('.close').disableTextSelect().on('click' + namespace, function(event) 
		{
			hide_picture()
		})
		
		picture.find('.previous').on('contextmenu' + namespace, function(event) 
		{
			event.preventDefault()
			picture.find('.close').click()
		})
		
		picture.find('.next').on('contextmenu' + namespace, function(event) 
		{
			event.preventDefault()
			picture.find('.close').click()
		})
		
		/*
		picture.find('.close').click(function(event)
		{
			event.preventDefault()
			hide_video()
		})
		*/
		
		$('#pictures').find('> li > [picture_id="' + page.data.картинка + '"]').click()
	
		//Режим.разрешить('правка')
	}
})()