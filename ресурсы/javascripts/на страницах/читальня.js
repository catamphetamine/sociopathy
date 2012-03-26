Режим.пообещать('правка')
	
function initialize_page()
{
	if (window.раздел)
		title(раздел.название)
	else
		title('Читальня')

	Подсказки.подсказка('В этом разделе вы можете читать и писать заметки на всевозможные темы.')

	insert_search_bar_into($('#panel'))
	$('.on_the_right_side_of_the_panel').css('right', $('#search').outerWidth(true) + parseInt($('#search').css('right')) + 'px')
	
	$('#categories').disableTextSelect()

	var путь_к_разделу
	var match = путь_страницы().match(/читальня\/(.+)/)
	if (match)
		путь_к_разделу = match[1]
		
	new Data_templater
	({
		data:
		{
			подразделы:
			{
				template_url: '/страницы/кусочки/раздел читальни.html',
				item_container: $('#categories'),
				postprocess_element: function(item)
				{
					return $('<li/>').append(item)
				}
			},
			заметки:
			{
				template_url: '/страницы/кусочки/заметка раздела читальни.html',
				item_container: $('#articles'),
				postprocess_element: function(item)
				{
					return $('<li/>').append(item)
				}
			}
		},
		conditional: $('#category_list_block[type=conditional]')
	},
	new  Data_loader
	({
		url: '/приложение/раздел читальни',
		parameters: { путь: путь_к_разделу },
		before_done_output: categories_loaded
	}))

	$(window).resize(center_categories_list)
	center_categories_list()
}

function categories_loaded()
{
	Режим.разрешить('правка')
}

function center_categories_list()
{
	center_list($('#categories'), { space: $('#content'), item_width: 250, item_margin: 40 })
}

function path_breadcrumbs(path, delta)
{
	if (!delta)
		delta = 0

	var path_parts = path.split('/')
	
	var path_html = ''
	
	var i = 0
	var how_much = path_parts.length + delta
	while (i < how_much)
	{
		link_path = ''
		
		var j = 0
		while (j <= i)
		{
			if (j > 0)
				link_path += '/'
			link_path += path_parts[j]
			j++
		}
	
		if (i < how_much - 1)
			path_html += '<a href="/читальня/' + link_path + '">'
		
		path_html += path_parts[i]
			
		if (i < how_much - 1)
		{
			path_html += '</a>'
			path_html += ' → '
		}
			
		i++
	}
	
	return path_html
}