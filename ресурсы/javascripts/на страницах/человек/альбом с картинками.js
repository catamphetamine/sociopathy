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
	var picture = $('.show_picture')
	var namespace = '.show_picture'
	
	content.find('.icon').click(function(event)
	{
		event.preventDefault()
		
		var container = picture.find('.container').empty()
		
		var url = $(this).attr('picture')
		get_image(url, function(result)
		{
			if (result.error)
				return
		
			var image = $(result.image)
			container.append(image)
			
			var factor = 1
			
			var max_width = content.width()
			var max_height = $(window).height()
			
			function propose_factor(new_factor)
			{
				if (new_factor < factor)
					factor = new_factor
			}
			
			var width = result.image.width
			var height = result.image.height
			
			if (result.image.width > max_width)
				propose_factor(max_width / width)
			
			if (result.image.height > max_height)
				propose_factor(max_height / height)
			
			width = parseInt(width * factor)
			height = parseInt(height * factor)
			
			image.width(width)
			image.height(height)
		})
		
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
	
		$(document).on('keydown' + namespace, function(event) 
		{
			if (Клавиши.is('Escape', event))
				hide_picture()
		})
		
		picture.on('click' + namespace, function(event) 
		{
			hide_picture()
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
}