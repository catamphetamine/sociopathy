(function()
{
	title('Люди')
	
	var bottom_loader
		
	var всего_людей
	
	var progress_bar
	
	function set_page_number(number)
	{
		if (number > 1)
			set_url('/люди/' + number)
		else 
			set_url('/люди')
	}
	
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
				if (data.люди.is_empty())
					return
				
				data.люди.last().страница = this.page.number - 1
				data.люди.last().первый = true
				
				return data.люди
			},
			before_done_more: function()
			{
				new_people_loaded()
			
				//set_page_number(this.page.number)
				
				if (this.есть_ли_ещё)
					previous_people_link.fade_in(0.2)
			},
			finished: function()
			{
				previous_people_link.hide()
			}
		})
		
		function activate_id_card_scrolling(data, id_card)
		{
			if (!data.первый)
				return
			
			id_card.on('appears_on_bottom.scroller', function(event)
			{
				set_page_number(data.страница)
				event.stopPropagation()
			})
			
			id_card.on('disappears_on_bottom.scroller', function(event)
			{
				set_page_number(data.страница - 1)
				event.stopPropagation()
			})
		}
	
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
		
		top_loader.activate = function()
		{
			previous_people_link.fade_in(0)
			previous_people_link.on('click', show_previous_people)
		}
		
		top_loader.deactivate = function() { previous_people_link.unbind() }
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/личная карточка.html',
			container: $('#id_cards'),
			show: function(data, options)
			{
				var id_card = $.tmpl(options.template_url, data)
					
				$('#id_cards').prepend($('<li/>').append(id_card))
				
				if (!data.страница)
					return
			
				activate_id_card_scrolling(data, id_card)
				прокрутчик.watch(id_card)
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
					
				if (data.люди.is_empty())
					return
				
				data.люди.first().страница = this.page.number + 1
				data.люди.first().первый = true
					
				return data.люди
			},
			before_done: function()
			{
				new_people_loaded()
			
				top_loader.index++
				top_loader.latest = bottom_loader.earliest
				previous_people_conditional.callback()
			},
			before_done_more: function()
			{
				new_people_loaded()
			}
		})
		
		new Data_templater
		({
			template_url: '/страницы/кусочки/личная карточка.html',
			container: $('#id_cards'),
			show: function(data, options)
			{
				var id_card = $.tmpl(options.template_url, data)
				
				$('#id_cards').append($('<li/>').append(id_card))
				
				if (!data.страница)
					return
					
				activate_id_card_scrolling(data, id_card)
				прокрутчик.watch(id_card)
			},
			conditional: main_conditional
		},
		bottom_loader)
		
		progress_bar = $('.vertical_progress_bar')
		progress_bar.appendTo('body')
	}
	
	page.unload = function()
	{
		bottom_loader.deactivate()
		progress_bar.remove()
	}
	
	var progress
	
	function new_people_loaded()
	{
		if (!progress)
		{
			progress = new Progress
			({
				element: $('.vertical_progress_bar .bar .progress'),
				maximum: всего_людей,
				vertical: true
			})
			
			progress_bar.show()
		}
		
		progress.update(bottom_loader.уже_загружено())
		ajaxify_internal_links(content)
	}
})()