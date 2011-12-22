function initialize_page()
{
	Режим.подсказка('В этом разделе вы можете читать и писать заметки на всевозможные темы.')

	insert_search_bar_into($('#panel'))
	$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
					
	$('#categories').disableTextSelect()
	
	//show_categories({data: categories}.data)
	
	new Data_templater
	({
		url: '/приложение/разделы_читальни',
		list: function (data) { return data.разделы },
		template_url: '/лекала/раздел читальни.html',
		item_container: $('#categories'),
		postprocess_item_element: function(element)
		{
			return $('<li/>').append(element)
		},
		conditional: $('#category_list_block[type=conditional]'),
		loader: Data_loader
	})
	
	$(window).resize(resize_categories_list)
	resize_categories_list()
}

function resize_categories_list()
{
	function calculate_categories_width(count)
	{
		var Category_width = 250
		var Category_side_spacing = 15
	
		return count * (Category_width + (Category_side_spacing * 2))
	}
	
	var available_width = parseInt($(window).width())
	
	var count = 0
	var width = 0
	var suitable_width = width
	while (true)
	{
		count++
		width = calculate_categories_width(count)
		
		if (width <= available_width)
			suitable_width = width
		else
			break
	}
	
	$('#categories').width(suitable_width).css('left', (available_width - suitable_width) / 2 + 'px')
}

/*
function show_categories(categories)
{
	var target = $('#categories')
	categories.each(function(category)
	{
		var list_item = $('<li/>').appendTo(target)
		
		if (category.id === 1)
			var link = $('<a/>').attr('href', encodeURIComponent(category.url_name)).css('background-image', 'url(\'' + get_category_icon_url(category.id) + '\')').appendTo(list_item)
		else
			var link = $('<a/>').attr('href', 'http://sobranie.net/читальня/' + encodeURIComponent(category.url_name)).css('background-image', 'url(\'' + get_category_icon_url(category.id) + '\')').appendTo(list_item)
		
		if (category.size === 'меньше')
			link.addClass('smaller')
		
		$('<span/>').text(category.name).appendTo(link)
		
		//list_item.click(function(event) { event.preventDefault(); })
	})
}

function get_category_icon_url(id)
{
	switch (id)
	{
		case 1:
			return '/картинки/temporary/categories/physics.jpg';
		 
		case 2:
			return '/картинки/temporary/categories/architecture.jpg';
		 
		case 3:
			return '/картинки/temporary/categories/machinery.jpg';
		 
		case 4:
			return '/картинки/temporary/categories/literature.jpg';
		 
		case 5:
			return '/картинки/temporary/categories/politics.jpg';
		 
		case 6:
			return '/картинки/temporary/categories/psychology.jpg';
		 
		case 7:
			return '/картинки/temporary/categories/history.jpg';

		case 8:
			return '/картинки/temporary/categories/sociology.jpg';

		case 9:
			return '/картинки/temporary/categories/electromagnetism.jpg';
	}
}
*/