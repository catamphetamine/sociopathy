(function()
{
	Режим.пообещать('правка')
		
	//var on_the_right_side_of_the_panel_right
	
	page.load = function()
	{
		if (!page.data.раздел)
			title('Читальня')
	
		Подсказки.подсказка('В этом разделе вы можете читать и писать заметки на всевозможные темы.')
	
		//insert_search_bar_into($('#panel'))
		
		//on_the_right_side_of_the_panel_right = $('.on_the_right_side_of_the_panel').css('right')
		//$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
		
		$('#categories').disableTextSelect()
	
		var путь_к_разделу
		var match = путь_страницы().match(/читальня\/(.+)/)
		if (match)
			путь_к_разделу = match[1]
			
		var conditional = initialize_conditional($('.main_conditional'), { immediate: true })

		function show_content()
		{
			new Data_templater
			({
				data_structure:
				{
					подразделы:
					{
						template_url: '/страницы/кусочки/раздел читальни.html',
						container: $('#categories'),
						postprocess_element: function(item)
						{
							return $('<li/>').append(item)
						}
					},
					заметки:
					{
						template_url: '/страницы/кусочки/заметка раздела читальни.html',
						container: $('#articles'),
						postprocess_element: function(item)
						{
							return $('<li/>').append(item)
						}
					}
				},
				conditional: conditional
			},
			new  Data_loader
			({
				url: '/приложение/читальня/раздел',
				parameters: { _id: page.data.раздел },
				get_data: function(data)
				{
					title(data.раздел.название)
			
					data.раздел.подразделы.forEach(function(подраздел)
					{
						if (путь_к_разделу)
							подраздел.путь = путь_к_разделу + '/' + подраздел.название
						else
							подраздел.путь = подраздел.название
					})
					
					data.раздел.заметки.forEach(function(заметка)
					{
						if (путь_к_разделу)
							заметка.путь = путь_к_разделу + '/' + заметка.название
						else
							подраздел.путь = подраздел.название
					})
				
					return data.раздел
				},
				before_done: categories_loaded
			}))
		
			$(window).on_page('resize.library', center_categories_list)
			center_categories_list()
		}
		
		if (!путь_к_разделу)
			return show_content()
				
		var link = '/читальня'
		var crumbs = [{ title: 'Читальня', link: link }]
		
		путь_к_разделу.split('/').forEach(function(раздел_или_заметка)
		{
			link += '/' + раздел_или_заметка
			crumbs.push({ title: раздел_или_заметка , link: link })
		})
		
		breadcrumbs
		(crumbs,
		show_content,
		function() { conditional.callback('Не удалось получить данные') })
	}
	
	page.unload = function()
	{
		//remove_search_bar()
		//$('.on_the_right_side_of_the_panel').css('right', on_the_right_side_of_the_panel_right)
	}
	
	function categories_loaded()
	{
		Режим.разрешить('правка')
		
		$(document).trigger('page_initialized')
	}
	
	function center_categories_list()
	{
		center_list($('#categories'), { space: $('#content'), item_width: 250, item_margin: 40 })
	}
	
	page.needs_initializing = true
})()