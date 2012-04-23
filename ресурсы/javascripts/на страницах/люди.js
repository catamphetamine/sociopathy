(function()
{
	title('Люди')
	
	var bottom_loader
		
	var всего_людей
	
	page.load = function()
	{
		Подсказки.подсказка('Здесь вы можете посмотреть список участников нашей сети. Список подгружается по мере того, как вы прокручиваете его вниз.')
	
		$('#content').disableTextSelect()
	
		var main_conditional = initialize_conditional(content.find('.main_conditional'))
		
		var previous_people_block = content.find('.previous_people_conditional')
		previous_people_block.prependTo(content.find('.main_conditional > [type=ok]'))
		var previous_people_conditional = initialize_conditional(previous_people_block)
		
		var Batch_size = 8
		var skip_pages = (page.data.номер_страницы || 1) - 1
		
		// загрузчик вверху
		
		var previous_people_link = previous_people_block.find('.previous_people > a')
		
		var top_loader = new Batch_loader
		({
			url: '/приложение/люди',
			batch_size: Batch_size,
			skip_pages: skip_pages + 1,
			reverse: true,
			parameters: { раньше: true, всего: всего_людей },
			get_data: function (data)
			{
				return data.люди
			},
			before_done_more: function()
			{
				new_people_loaded()
			
				if (this.page.number > 1)
					set_url('/люди/' + this.page.number)
				else 
					set_url('/люди')
				
				if (this.есть_ли_ещё)
					previous_people_link.fade_in(0.2)
			},
			finished: function()
			{
				previous_people_link.hide()
			}
		})
		
		function show_previous_people(event)
		{
			event.preventDefault()
			top_loader.deactivate()
			var indicate_loading = top_loader.load_more()
			
			var latest = top_loader.latest
			previous_people_link.fade_out(0.2, function()
			{
				if (top_loader.latest === latest)
					indicate_loading()
			})
		}
		
		top_loader.activate = function() { previous_people_link.on('click', show_previous_people) }
		top_loader.deactivate = function() { previous_people_link.unbind() }
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/личная карточка.html',
			item_container: $('#id_cards'),
			show: function(data, options)
			{
				var id_card = $.tmpl(options.template_url, data)
				$('#id_cards').prepend($('<li/>').append(id_card))
			},
			conditional: previous_people_conditional,
			load_data: false
		},
		top_loader)
		
		if (skip_pages)
			top_loader.activate()
		else
		{
			previous_people_block.hide()
		}
		
		// загрузчик внизу
		
		bottom_loader = new Batch_loader_with_infinite_scroll
		({
			url: '/приложение/люди',
			batch_size: Batch_size,
			skip_pages: skip_pages,
			parameters: { всего: всего_людей },
			get_data: function(data)
			{
				if (!всего_людей)
					всего_людей = data.всего
					
				return data.люди
			},
			before_done_output: function()
			{
				new_people_loaded()
			
				top_loader.index++
				top_loader.latest = bottom_loader.earliest
				previous_people_conditional.callback()
			},
			before_done_more_output: function()
			{
				new_people_loaded()
				
				if (this.page.number > 1)
					set_url('/люди/' + this.page.number)
				else 
					set_url('/люди')
			}
		})
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/личная карточка.html',
			item_container: $('#id_cards'),
			postprocess_element: function(item)
			{
				return $('<li/>').append(item)
			},
			conditional: main_conditional
		},
		bottom_loader)
	}
	
	page.unload = function()
	{
		bottom_loader.deactivate()
	}
	
	var progress
	
	function new_people_loaded()
	{
		if (!progress)
		{
			progress = new Progress
			({
				element: $('.progress_bar .bar .progress'),
				maximum: всего_людей
			})
			
			//$('body').css('margin-bottom', progress.options.element.outerHeight(true) + 'px')
		}
		
		progress.update(bottom_loader.уже_загружено())
		ajaxify_internal_links(content)
	}
})()