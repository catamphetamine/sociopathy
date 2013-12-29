var panel
var content

var page

проверить_доступ(Uri.parse().path)

$(document).on('scripts_loaded', function()
{
	loading_page({ immediate: true })

	подгрузить_статику(function(ошибка)
	{
		if (ошибка)
			return
			
		вставить_общее_содержимое(function()
		{
			navigate_to_page()
		
			//check_browser_support()
		})
	})
})

$(document).on('page_content_ready', function()
{
	activate_anchors()
	ajaxify_internal_links(page.element)
	
	page.Data_store.initialize_store(function(data)
	{
		var real_page_element = $('#page')
	
		real_page_element.empty()
		
		// delete previous page stylesheet
		if (!first_time_page_loading && !page.same_page)
		{
			if (Configuration.Optimize)
				Dom.remove(head.querySelector('style[for="' + old_page_stylesheet_link + '"]'))
			else
				Less.unload_style(old_page_stylesheet_link)
		}
			
		page.element.children().appendTo(real_page_element)
		page.element = real_page_element
		
		hide_page_loading_screen()
	})
})

hotkey('Консоль', function()
{
	info('Console')
})

/*
hotkey('Показать_навершие',
{
	check: function(event)
	{
		if (!event.target)
			return false
		
		if (!прокрутчик.scrolled())
			return false
		
		if (event.target instanceof HTMLInputElement
			|| event.target instanceof HTMLTextAreaElement
			|| is_node_editable(event.target))
		{
			if (Клавиши.is('Tab') && is_node_untabbable(event.target))
			{
				// can show panel
			}
			else
				return true
		}
			
		return true
			
	},
	on_release: function()
	{
		$('.on_the_right_side_of_the_panel').show()
		$('#panel').removeClass('sticky')
	}
},
function(event)
{
	$('.on_the_right_side_of_the_panel').hide()
	$('#panel').addClass('sticky')
})
*/

var can_navigate_to_page = false

$(document).on('page_initialized', function()
{
	var after_styles = function()
	{
		if (first_time_page_loading)
			$(document).trigger('styles_loaded')
		
		if (!пользователь)
		{
			if (путь_страницы() === '')
			{
				$('#panel .enter').show()
				$('#logo').hide()
			}
			else
			{
				$('#panel .enter').hide()
				$('#logo').show()
			}
		}
				
		page.full_load(function()
		{
			ajaxify_internal_links()
			
			$(document).trigger('display_page')
			
			$('.non_selectable').disableTextSelect()
			
			$(document).on_page_once('page_content_ready', function()
			{
				if (page.data.scroll_to)
					прокрутчик.scroll_to(page.data.scroll_to)
				else if (get_hash())
					go_to_anchor()
				else
					прокрутчик.scroll_to_top()
			})

			if (first_time_page_loading)
				document.id('loading_screen').classList.remove('first_time_page_loading')
			
			page_initialized()
			
			can_navigate_to_page = true
			
			navigating = false
		})
	}
	
	if (first_time_page_loading)
	{
		insert_script('/javascripts/less', function()
		{
			if (window.development_mode)
				less.env = 'development'
			
			if (пользователь)
			{
				$('#logo').remove()
				$('#panel .enter').remove()
			}
			
			finish_initializing_panel_icons()
		
			panel = new Panel()
			
			$(document).trigger('panel_loaded')
			   
			panel.highlight_current_page()

			if (пользователь)
			{
				$(document).on('ether_is_online', function()
				{
					after_styles()
				})
			}
			else
			{
				after_styles()
			}
		})

		$(window).on('popstate', function(event)
		{
			if (!history_stacked)
				return
			
			navigate_to_page({ state: event.originalEvent.state })
		})
	}
	else
	{
		if (Configuration.Optimize)
			after_styles()
		else
			Less.load_style(add_version(get_page_less_style_link()), after_styles)
	}
})