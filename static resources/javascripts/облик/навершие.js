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

var Icons_version = 4

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
	icon_size: 32,
	
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
		$('#' + this.options.menu_id + ' > li').each(function()
		{
			var menu_item = $(this)
				
			menu_item.wrapInner('<a/>')
			
			hyperlink = $(menu_item.children()[0])
			hyperlink.attr('href', menu_item.attr('link'))
			
			// for every state
			hyperlink.find('> [state]').each(function()
			{
				var state = $(this)
				
				// initialize variables
				var picture = state.attr('picture')
				
				if (!picture)
					return
	
				var title = picture
				if (state.attr('title'))
					title = state.attr('title')
				
				// activate panel menu item fading
				var button = new image_button
				(
					state, 
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
				
				var id = title
				if (id.indexOf(' (') >= 0)
					id = id.substring(0, id.indexOf(' ('))
				
				state.css
				({
					position: 'absolute'
				})
				
				if (state.attr('secondary'))
				{
					state.removeAttr('secondary')
				
					state.css
					({
						'z-index': -1,
						opacity: 0
					})
				}
				else
					state.attr('always_shown', true)
			})
		})
	},
	
	// initialize panel
	initialize: function()
	{
		this.activate_buttons(this.options.images_path)
	
		$('#' + this.options.menu_id + ' > li > a').each(function()
		{
			$(this).append('<div class="notification_counter"/>')
		})
		
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
		
		if (page_button_type)
		{
			panel.menu_item_button_switcher
			({
				type: page_button_type,
				show: { is_current_page: true }
			})
			.on()
		}
		
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
				
			//console.log(type + postfix)
			
			var button = this.buttons[type + postfix]
			
			if (!button)
				throw 'button not found: ' + type + postfix
			
			return button.element
		}
		.bind(this)
		
		function get_button_to_show()
		{
			//console.log('show: ')
			return get_button(options.show)
		}
		
		function get_button_to_hide()
		{
			//console.log('hide: ')
			return get_button(options.hide)
		}
		
		function hide_all_other_buttons()
		{
			var to_show = get_button_to_show()
			var to_hide = get_button_to_hide()
			
			to_show.parent().find('> [state]').each(function()
			{
				if (this === to_show.node() || this === to_hide.node())
					return
				
				var another = $(this)
				
				if (another.attr('always_shown'))
					return
				
				another
					.css('z-index', -1)
					.fade_out(0)
			})
		}

		function on()
		{	
			hide_all_other_buttons()
			
			var to_hide = get_button_to_hide()
			
			if (!to_hide.attr('always_shown'))
				to_hide
					.css('z-index', -1)
					.fade_out(options.fade_out_duration)
				
			get_button_to_show()
				.css('z-index', 0)
				.fade_in(options.fade_in_duration)
		}
		
		function off()
		{
			hide_all_other_buttons()
			
			var to_show = get_button_to_show()
			
			if (!to_show.attr('always_shown'))
				to_show
					.css('z-index', -1)
					.fade_out(options.fade_out_duration)
			
			get_button_to_hide()
				.css('z-index', 0)
				.fade_in(options.fade_in_duration)
		}
		
		var idle_icon = this.buttons[options.type]
		
		return { on: on, off: off, panel_item: idle_icon.element.parent() }
	}
})

function finish_initializing_panel_icons()
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
		
		var idle_icon = $('<div/>')
			
		//idle_icon.attr('link', раздел.attr('link'))
		idle_icon.attr('picture', раздел.attr('picture') )
		idle_icon.attr('title', раздел.attr('title'))
		idle_icon.attr('state', 'idle')
		
		idle_icon.appendTo(раздел)
		
		states.for_each(function()
		{
			var state_icon = $('<div/>')
			
			state_icon.attr('secondary', true)
			//state_icon.attr('link', раздел.attr('link'))
			state_icon.attr('picture', раздел.attr('picture') + ' (' + this + ')')
			state_icon.attr('title', раздел.attr('title') + ' (' + this + ')')
			state_icon.attr('state', this)
			
			state_icon.appendTo(раздел)
		})
		
		раздел.removeAttr('picture')
	})
}

function add_top_panel_button()
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
		
	icon.attr('title', this.title)
		
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