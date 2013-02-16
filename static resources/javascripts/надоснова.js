var first_time_page_loading = true
			
var panel
var content

var page

var host = Uri.parse().host
var port = Uri.parse().port

Configuration = Object.x_over_y
({
	Upload_server_port: 8091,
	Websocket_server: host + ':8080',
	User_is_online_for: 8 * 60,
	Book_shelf_size: 6,
	Minimum_book_shelves: 3,
	Video:
	{
		Icon:
		{
			Size:
			{
				Width: 640
			}
		},
		Size:
		{
			Width: 560,
			Height: 315
		}
	}
},
Configuration)

проверить_доступ(Uri.parse().path) //путь_страницы())

$(document).on('scripts_loaded', function()
{
	loading_page()

	Page.element = $('#page')

	подгрузить_шаблоны(function(ошибка)
	{
		if (ошибка)
			return
			
		вставить_общее_содержимое(function()
		{
			navigate_to_page()
		
			check_browser_support()
		})
	})
})

$(document).on('page_initialized', function()
{
	activate_anchors()
	ajaxify_internal_links(Page.element)
	
	page.Data_store.initialize(function(data)
	{
		page_initialized()
	})
})

var can_navigate_to_page = false

$(document).on('page_loaded', function()
{
	var after_styles = function()
	{
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
			
			$(document).on_page('page_initialized', function()
			{
				if (page.data.scroll_to)
					$(window).scrollTop(page.data.scroll_to)
				else
					go_to_anchor()
			})

			page_loaded()
			
			can_navigate_to_page = true
			
			navigating = false
		})
	}
	
	if (first_time_page_loading)
	{	
		$.getScript('/javascripts/less.js', function()
		{
			if (window.development_mode)
				less.env = 'development'
				
			//alert('styles_loaded')
			
			if (пользователь)
			{
				$('#logo').remove()
				$('#panel .enter').remove()
			}
			
			prepare_panel_icons()
		
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
		Less.load_style(add_version(get_page_less_style_link()), after_styles)
	}
})