var first_time_page_loading = true

var пользователь = null
			
var panel
var content

var page

var host = parseUri().host
var Options =
{
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
}

if (путь_страницы() === 'сеть' || путь_страницы().starts_with('сеть/'))
	if (!$.cookie('user'))
		window.location = '/'

$(function()
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
	
	if (page.Data_store.что)
		page.Data_store.load(function(data)
		{
			page.Data_store.populate(data)
			page_initialized()
		})
	else
		page_initialized()
})

$(document).on('page_loaded', function()
{
	var after_styles = function()
	{
		page.full_load(function()
		{
			ajaxify_internal_links()
		
			$(document).trigger('display_page')
	
			page_loaded()
			
			$('.non_selectable').disableTextSelect()
			
			go_to_anchor()
			
			navigating = false
		})
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
		
		$(window).on('popstate', function()
		{
			navigate_to_page()
		})
	}
	else
	{
		//console.log(get_page_less_style_link())
		Less.load_style(get_page_less_style_link(), after_styles)
	}
})