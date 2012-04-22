var first_time_page_loading = true

var пользователь = null
			
var panel
var content

var page

var host = parseUri().host
var Options =
{
	Upload_server_port: 8090,
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
}

$(function()
{
	loading_page()

	Page.element = $('#page')

	подгрузить_шаблоны(function()
	{
		вставить_общее_содержимое(function()
		{
			navigate_to_page()
		
			check_browser_support()
		})
	})
})

$(document).on('page_initialized', function()
{
	ajaxify_internal_links(Page.element)
})

$(document).on('page_loaded', function()
{
	var after_styles = function()
	{
		page.load()
			
		ajaxify_internal_links()
	
		page_loaded()
		
		$('.non_selectable').disableTextSelect()
		
		go_to_anchor()
		
		navigating = false
	}
	
	if (first_time_page_loading)
	{
		$.getScript('/javascripts/less.js', function()
		{
			if (пользователь)
				$('#logo').remove()
		
			panel = new Panel()
			panel.highlight_current_page()
			
			after_styles()
		})
	}
	else
	{
		Less.load_style(get_page_less_style_link(), after_styles)
	}
})