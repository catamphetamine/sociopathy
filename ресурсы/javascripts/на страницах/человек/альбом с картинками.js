(function()
{
	title(page.data.альбом + '. ' + 'Картинки. ' + page.data.адресное_имя)
	
	Режим.пообещать('правка')
	Режим.пообещать('действия')
	
	page.load = function()
	{
		var conditional = initialize_conditional($('.main_conditional'))
		
		breadcrumbs
		([
			{ title: page.data.адресное_имя, link: '/люди/' + page.data.адресное_имя },
			{ title: 'Картинки', link: '/люди/' + page.data.адресное_имя + '/картинки' },
			{ title: page.data.альбом, link: '/люди/' + page.data.адресное_имя + '/картинки/' + page.data.альбом }
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
				conditional: $('.main_conditional')
			},
			new  Data_loader
			({
				url: '/приложение/человек/картинки/альбом',
				parameters: { 'адресное имя': page.data.адресное_имя, альбом: page.data.альбом },
				before_done_output: pictures_loaded,
				get_data: function(data)
				{
					if (data.альбом.описание)
					{
						$('#pictures').before($('<p/>').addClass('description').text(data.альбом.описание))
					}
					
					return data.альбом.картинки
				}
			}))
		
			page.on($(window), 'resize.pictures', center_pictures_list)
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
		var picture = $('.show_picture')
		var namespace = '.show_picture'
		
		var container = picture.find('.container')
		
		function previous_picture()
		{
			var previous_picture_icon = current_picture_icon.parent().prev().children().eq(0)
			if (!previous_picture_icon.exists())
				return hide_picture()
			
			show_picture_file(previous_picture_icon)
		}
		
		picture.find('.previous').on('click', function(event) 
		{
			previous_picture()
		})
		
		function next_picture()
		{
			var next_picture_icon = current_picture_icon.parent().next().children().eq(0)
			if (!next_picture_icon.exists())
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
		
		var progress = $('.progress_bar .bar .progress')
		
		function update_progress()
		{
			progress.width(parseInt(get_picture_number() * ($(window).width() / all_icons.length)))
		}
		
		function show_picture_file(icon)
		{
			current_picture_icon = icon
		
			container.empty().hide()
			
			var description_height = 0
			if (icon.next().is('p'))
			{
				description = $('<p/>').addClass('picture_description').text(icon.next().text())
				description.appendTo(content)
				description_height = description.outerHeight(true)
				description.appendTo(container)
			}
				
			var url = icon.attr('picture')
			get_image(url, function(result)
			{
				if (result.error)
					return
			
				var image = $(result.image)
				container.prepend($('<div/>').addClass('picture').append(image))
	
				var initial_width = result.image.width
				var initial_height = result.image.height
				
				var link = $('<a/>').attr('target', '_blank').attr('href', 'http://google.ru').appendTo('body')
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
				
				update_progress()
			})
		}
		
		content.find('.icon').click(function(event)
		{
			event.preventDefault()
			
			container.empty()
			
			show_picture_file($(this))
			show_picture()
		})
		
		function hide_picture()
		{
			$(document).unbind(namespace)
			picture.unbind(namespace)
			picture.fade_out(0.0)
		}
		
		function show_picture()
		{
			picture.fade_in(0.0, function() { picture.focus() })
		
			page.on($(document), 'keydown' + namespace, function(event) 
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
			
			page.on($(document), 'keyup' + namespace, function(event) 
			{
				//if (Клавиши.is('Shift', event))
				
				container.css('cursor', 'default')
			})
			
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
		}
		
		/*
		picture.find('.close').click(function(event)
		{
			event.preventDefault()
			hide_video()
		})
		*/
	
		Режим.разрешить('правка')
		Режим.разрешить('действия')
		
		$(document).trigger('page_initialized')
	}
})()