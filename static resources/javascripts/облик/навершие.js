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

var Icons_version = 1

var Page_icons = []

function Page_icon(data)
{
	Page_icons.add(data)
}

var match_page = function(options)
{
	if (options.page)
	{
		if (Страница.is(options.page))
			return true
		
		if (options.when)
			if (options.when())
				return true
	}
	
	if (options.page_pattern)
		if (Страница.matches(options.page_pattern))
			return true
}

function get_page_button_type()
{
	if (Страница.эта() === '_wait_')
		return page_data('_icon')
		
	var i = 0
	while (i < Page_icons.length)
	{
		var page_and_icon = Page_icons[i]
		
		if (match_page(page_and_icon))
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
					skin: 'url(\'' + picture + '.png' + '?version=' + Icons_version + '\')',
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
			
			button.element.css
			({
				position: 'absolute'
			})
			
			if (id !== title)
			{
				button.element.css
				({
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
		
		var previously_highlighted_page_button_type = panel.highlighted_page_button_type
		
		var page_button_type = get_page_button_type()
		
		if (previously_highlighted_page_button_type)
		{
			if (page_button_type === previously_highlighted_page_button_type)
				return
		
			panel.menu_item_button_switcher
			({
				type: previously_highlighted_page_button_type,
				show: { is_current_page: true }
			})
			.off()
		}
		
		panel.menu_item_button_switcher
		({
			type: page_button_type,
			show: { is_current_page: true }
		})
		.on()
		
		panel.highlighted_page_button_type = page_button_type
	},

	menu_item_button_switcher: function(options)
	{
		var default_options =
		{
			fade_in_duration: 0,
			fade_out_duration: 0
		}
		
		options = Object.merge(default_options, options)

		var type = options.type
		
		var get_button = function(options)
		{
			options = options || {}
			
			var has_news = false
			var is_current_page = false
			
			if (options.has_news || (Новости.news[type] && Новости.news[type].anything_new()))
				has_news = true
				
			if (options.is_current_page || get_page_button_type() === type)
				is_current_page = true
				
			var modificator
				
			if (has_news && is_current_page)
			{
				modificator = 'выбрано и непрочитанные'
			}
			else if (has_news)
			{
				modificator = 'непрочитанные'
			}
			else if (is_current_page)
			{
				modificator = 'выбрано'
			}
			
			var postfix = ''
			if (modificator)
				postfix = ' (' + modificator + ')'
			
			var button = this.buttons[type + postfix]
			
			if (!button)
				throw 'button not found: ' + type + postfix
			
			return button.element
		}
		.bind(this)
		
		/*
		var menu_item = this.buttons[type].element.parent()
		
		function get_shown_button()
		{
			var shown_button
			
			menu_item.children().each(function()
			{
				var button = $(this)
				
				if (button.css('z-index') === 0)
					shown_button = button
			})
			
			return shown_button
		}
		*/
		
		function get_button_to_show() { get_button(options.show) }
		function get_button_to_hide() { get_button(options.hide) }

		/*		
		function get_buttons_to_hide()
		{
			var hide_buttons = []
			
			var button_to_show = get_button_to_show().node()
			
			menu_item.children().each(function()
			{
				if (this !== button_to_show)
					hide_buttons.push($(this))
			})
			
			return hide_buttons
		}
		*/
			
		var on = function(these_options)
		{
			options = Object.merge(options, these_options)
			
			if (get_button_to_show().node() === get_button_to_hide().node())
				return
			
			get_button_to_show()
				.css('z-index', 0)
				.fade_in(options.fade_in_duration)
			
			get_button_to_hide()
				.css('z-index', -1)
				.fade_out(options.fade_out_duration)
		}
		.bind(this)
		
		var off = function(these_options)
		{
			options = Object.merge(options, these_options)
			
			if (get_button_to_show().node() === get_button_to_hide().node())
				return
			
			get_button_to_show()
				.css('z-index', -1)
				.fade_out(options.fade_out_duration)
			
			get_button_to_hide()
				.css('z-index', 0)
				.fade_in(options.fade_in_duration)
		}
		
		return { on: on, off: off }
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
			
			state_icon.insert_after(раздел)
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
		
		url = text(this.icon.to)
		if (!url.starts_with('/'))
			url = '/' + url
		
		picture = '/plugins/' + this.title + '/icon/' + this.icon.picture
	}
	
	if (is_private)
		url = Url_map.network + url
	
	var icon = $('<li/>')
		.attr('picture', picture)
		.attr('link', url)
		.attr('order', this.icon.order)
		//.text(text(this.title))
		
	if (plugin)
		icon.attr('title', plugin.title)
		
	if (this.icon.unreadable)
		icon.attr('unreadable', true)
		
	if (this.icon.restricted)
		icon.attr('hidden', true)
		
	var menu = $('#panel_menu')
	var menu_divider = menu.find('.divider')
	
	if (typeof this.icon.order === 'undefined')
	{
		switch (this.icon.group)
		{
			case 'main':
				return icon.before(menu_divider)
			
			case 'other':
			default:
				return icon.appendTo(menu)
		}
	}
	
	var icons = menu.children()
	
	var into_main_group = this.icon.group === 'main'
	var this_group = false
	
	var index = 0
	while (index < icons.length)
	{
		if (!into_main_group)
		{
			if (!this_group)
			{
				if (icons[index] === menu_divider.node())
					this_group = true
			
				index++
				continue
			}
		}
		
		var another_icon = $(icons[index])
		var order = another_icon.attr('order')
		
		if (typeof order === 'undefined' || order >= this.icon.order)
			return icon.insert_before(another_icon)
		
		index++
	}
	
	icon.appendTo(menu)
}