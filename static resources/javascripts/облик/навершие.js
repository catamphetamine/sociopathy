/**
 * Panel
 * 
 * This script creates top panel bar with clickable menu items having tooltips.
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var Page_icons = []

function Page_icon(data)
{
	Page_icons.add(data)
}

var match_page = function(options, new_page)
{
	if (options.page)
	{
		if (Страница.is(options.page))
			return true
		
		if (options.when)
			if (options.when(new_page))
				return true
	}
	
	if (options.page_pattern)
		if (Страница.matches(options.page_pattern))
			return true
}

var get_page_button = function()
{
	if (Страница.эта() === '_wait_')
		return page.data._icon
		
	var i = 0
	while (i < Page_icons.length)
	{
		var page_and_icon = Page_icons[i]
		
		if (match_page(page_and_icon, page))
			return page_and_icon.icon
		
		i++
	}
}

var Panel = new Class
({
	icon_size: 60,
	
	buttons: {},
	
	options:
	{
		menu_id: "panel_menu",

		images_path: "/картинки/навершие/menu",
	
		tooltip_show_bottom: 76,
		tooltip_hide_bottom: 86
	},
	
	activate_buttons: function(images_path)
	{
		var panel = this
	
		// for every panel menu item
		$("#" + this.options.menu_id + " > li").each(function()
		{
			var $menu_item = $(this)
			
			// initialize variables
			var picture = $menu_item.attr("picture")
			var link = $menu_item.attr("link")
			
			if (!picture)
				return

			var title = picture
			if ($menu_item.attr('title'))
			{
				title = $menu_item.attr('title')
				$menu_item.removeAttr('title')
			}

			// place the panel menu item
			var $hyperlink = $('<a/>')
			$hyperlink.addClass('image')
			$hyperlink.prependTo($menu_item)

			if (link)
				$hyperlink.attr('href', link)
			
			// activate panel menu item fading
			var button = new image_button
			(
				$hyperlink, 
				{
					skin: 'url(\'' + picture + '.png' + '\')',
					width: panel.icon_size,
					height: panel.icon_size
				}
			)
			
			button.setOptions
			({
				'ready frame fade in duration': 0.3,
				'ready frame fade out duration': 0.3,
				
				'pushed frame fade in duration': 0.3,
				'pushed frame fade out duration': 0.3,
	
				'pushed frame fade in easing': 'swing',
				'pushed frame fade out easing': 'swing'
			})
			
			panel.buttons[title] = button
			
			if ($menu_item.attr('hidden'))
				$menu_item.hide()
				
			var id = title
			if (id.indexOf(' (') >= 0)
				id = id.substring(0, id.indexOf(' ('))
				
			if (id !== title)
			{
				button.element.css
				({
					position: 'absolute',
					'z-index': -1,
					opacity: 0
				})
			
				button.element.appendTo(panel.buttons[id].element.parent().node())
			}
		})
	},
	
	// initialize panel
	initialize: function()
	{
		this.activate_buttons(this.options.images_path)
	
		if (пользователь)
		{	
			var loading_indicator = $('#panel_menu > li > .loading')
			var opacity = loading_indicator.css('opacity')
			
			this.loading =
			{
				show: function() { loading_indicator.css('opacity', opacity) },
				hide: function() { loading_indicator.css('opacity', 0) }
			}
		}
		
		$('#panel').children().disableTextSelect()
	},
	
	highlight_current_page: function()
	{
		var panel = this
		
		var previously_highlighted_menu_item = panel.highlighted_menu_item
		
		var page_button = get_page_button()
		
		function highlight_current_page_button(page_button)
		{
			if (previously_highlighted_menu_item && page_button === previously_highlighted_menu_item)
				return
			
			if (previously_highlighted_menu_item)
			{
				panel.toggle_buttons
				({
					type: previously_highlighted_menu_item,
					fade_in_duration: 0,
					fade_out_duration: 0,
					hide: { button: { current: true } }
				})
			}
			
			if (!page_button)
				return
			
			panel.toggle_buttons
			({
				type: page_button,
				fade_in_duration: 0,
				fade_out_duration: 0,
				show: { button: { current: true } }
			})
			
			panel.highlighted_menu_item = page_button
				
			return true
		}
		
		highlight_current_page_button(page_button)
	},

	toggle_buttons: function(options)
	{
		var type = options.type
		
		var get_button = function(options)
		{
			options = options || {}
			
			var news = false
			var current = false
			
			if (options.new || (Новости.news[type] && Новости.news[type].anything_new()))
				news = true
				
			if (options.current || get_page_button() === type)
				current = true
				
			var postfix = ''
				
			if (news)
			{
				if (current)
					postfix = ' (выбрано и непрочитанные)'
				else
					postfix = ' (непрочитанные)'
			}
			else if (current)
				postfix = ' (выбрано)'
			
			if (!this.buttons[type + postfix])
			{
				console.log('button not found: ' + type + postfix)
				return
			}
			
			return this.buttons[type + postfix].element
		}
		.bind(this)
		
		var get_hidden_button = function () { return get_button(options.hide ? options.hide.button : {}) }
		var get_shown_button = function () { return get_button(options.show ? options.show.button : {}) }
		
		var get_buttons_to_hide = function()
		{
			var hidden = get_hidden_button()
			
			if (!hidden)
				return []
			
			var hide_buttons = []
			
			hidden.parent().children().each(function()
			{
				if (this !== get_shown_button().node())
					hide_buttons.push($(this))
			})
			
			return hide_buttons
		}
			
		var activate = function(these_options)
		{
			//if (get_hidden_button().node() === get_shown_button().node())
			//	return
			
			options = Object.merge(options, these_options)
				
			var shown = get_shown_button()
			
			if (shown)
				shown.css('z-index', 0)
			
			if (options.immediate)
			{
				get_buttons_to_hide().for_each(function()
				{
					this.hide()
				})
				
				if (shown)
					shown.show().css('opacity', 1)
			}
			else
			{
				if (shown)
					shown.fade_in(options.fade_in_duration)
				
				get_buttons_to_hide().for_each(function()
				{
					this.fade_out(options.fade_out_duration)
				})
			}
		
			//panel.buttons[options.type].tooltip.update_position()
		}
		.bind(this)
		
		var deactivate = function(these_options)
		{
			if (get_hidden_button().node() === get_shown_button().node())
				return
			
			options = Object.merge(options, these_options)
		
			get_shown_button().css('z-index', -1)
			
			if (options.immediate)
			{
				get_shown_button().hide()
				get_hidden_button().show().css('opacity', 1)
			}
			else
			{
				get_hidden_button().fade_in(options.fade_in_duration)
				get_shown_button().fade_out(options.fade_out_duration)
			}
		}
		
		if (options.initialize)
		{
			var result =
			{
				on: activate,
				off: deactivate
			}
			
			return result
		}
		else
		{
			//if (!options.fade)
			//	options.immediate = true
				
			activate()
		}
	}
})

function prepare_panel_icons()
{
	$('#panel_menu').find('> li').each(function()
	{
		var раздел = $(this)
		
		if (!раздел.attr('picture'))
			return
		
		var states = ['выбрано']
		
		if (раздел.attr('unreadable'))
		{
			раздел.removeAttr('unreadable')
			states = ['выбрано', 'непрочитанные', 'выбрано и непрочитанные']
		}
			
		states.for_each(function()
		{
			var state_icon = $('<li/>')
			
			state_icon.attr('hidden', 'true')
			state_icon.attr('link', раздел.attr('link'))
			state_icon.attr('picture', раздел.attr('picture') + ' (' + this + ')')
			state_icon.attr('title', раздел.attr('title') + ' (' + this + ')')
			
			state_icon.append_after(раздел)
		})
	})
}

function add_top_panel_button(plugin)
{
	if (!this.icon)
		return
		
	var is_private = this.private
	var url = this.url
	var picture = '/картинки/навершие/menu/' + this.icon
	
	if (typeof this.icon === 'object')
	{
		is_private = this.icon.private
		url = this.icon.to
		picture = '/plugins/' + this.title + '/icon/' + this.icon.picture
	}
	
	if (is_private)
		url = '/сеть' + url
	
	var icon = $('<li/>')
		.attr('picture', picture)
		.attr('link', url)
		//.text(text(this.title))
		
	if (plugin)
		icon.attr('title', plugin.title)
		
	if (this.icon.unreadable)
		icon.attr('unreadable', true)
		
	if (this.icon.restricted)
		icon.attr('hidden', true)
		
	icon.appendTo('#panel_menu')
}