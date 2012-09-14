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

var есть_ли_новости = function(what)
{
	switch (what)
	{
		case 'болталка':
			return Новости.что_нового.болталка != null
		
		case 'беседы':
			return !Object.пусто(Новости.что_нового.беседы)
			
		case 'обсуждения':
			return !Object.пусто(Новости.что_нового.обсуждения)
			
		case 'новости':
			return !Новости.что_нового.новости.пусто()
	}
}

var page_buttons =
[
	{ page: 'читальня', button: 'читальня' },
	{ page: 'заметка', button: 'читальня' },
	{ page: 'люди', button: 'люди' },
	
	{ page: 'человек/человек', button: 'люди' },
	{ page_pattern: 'помощь(/.*)?', button: 'помощь' },
	
	{ page: 'сеть/новости', button: 'новости' },
	{ page: 'сеть/болталка', button: 'болталка' },
	
	{ page: 'сеть/обсуждения', button: 'обсуждения' },
	//{ page: 'сеть/обсуждение', button: 'обсуждения' },
	
	{ page: 'сеть/беседы', button: 'беседы' },
	//{ page: 'сеть/беседа', button: 'беседы' },
	
	//{ page: 'человек/дневник', button: 'дневник' },
	//{ page: 'человек/запись в дневнике', button: 'дневник' },
	
	//{ page: 'человек/журнал', button: 'журнал' },
	//{ page: 'человек/запись в журнале', button: 'журнал' },
	
	//{ page: 'человек/книги', button: 'книги' },
	{ page: 'человек/книги', button: 'люди' },
	
	{ page: 'человек/картинки', button: 'люди' },
	{ page: 'человек/альбом с картинками', button: 'люди' },
	{ page: 'человек/видео', button: 'люди' },
	{ page: 'человек/альбом с видео', button: 'люди' },
	
	{ page: 'сеть/круги', button: 'круги' },
	{ page: 'сеть/настройки', button: 'настройки' },
	{ page: 'сеть/мусорка', button: 'мусорка' },
	
	{ page: 'управление', button: 'управление' }
]

var match_page = function(options)
{
	if (options.page)
		if (!Страница.is(options.page))
			return false
	
	if (options.page_pattern)
		if (!Страница.matches(options.page_pattern))
			return false
		
	return true
}

var get_page_button = function()
{
	var i = 0
	while (i < page_buttons.length)
	{
		var page_and_button = page_buttons[i]
		
		if (match_page(page_and_button))
			return page_and_button.button
		
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
			var title = $menu_item.attr("name")
			var link = $menu_item.attr("link")

			if (!title)
				return
			
			// tooltip
			//$('<em/>').append($menu_item.contents()).appendTo($menu_item)
			$menu_item.empty()

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
					skin: 'url(\'' + images_path + '/' + title + '.png' + '\')',
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
				
			var type = title
			if (type.indexOf(' (') >= 0)
				type = type.substring(0, type.indexOf(' ('))
				
			if (type !== title)
			{
				button.element.css
				({
					position: 'absolute',
					'z-index': -1,
					opacity: 0
				})
			
				button.element.appendTo(panel.buttons[type].element.parent().node())
			}
		})
	},
	
	activate_tooltips: function()
	{
		var panel = this
		var tooltips = []
		
		// for every tooltip
		$('#' + this.options.menu_id + ' > li > a').each(function()
		{
			var menu_item = $(this)
			
			// get the tooltip and position it appropriately
			var tooltip = $(this).next('em')
			tooltip.disableTextSelect()
			
			tooltips.push(tooltip)
			
			if (tooltip.parent().attr('not_yet_implemented'))
			{
				menu_item.click(function(event) { event.preventDefault(); info('Ещё не сделано'); })
			}
			
			tooltip.addClass('panel_menu_tooltip')
			$('body').append(tooltip)
			
			tooltip.data('menu item', menu_item)
			panel.buttons[menu_item.parent().attr('name')].tooltip = tooltip
			
			tooltip.update_position = function()
			{
				this.css('left', (tooltip.data('menu item').offset().left + 10) + 'px')
			}
			
			tooltip.update_position()
			
			return
			
			$(this).hover
			(
				// on mouse roll over - show
				function() 
				{
					var speed = 'slow'
				
					tooltips.each(function(a_tooltip)
					{
						if (a_tooltip !== tooltip && a_tooltip.css('display') !== 'none')
						{
							a_tooltip.stop(true, true).fadeOut(100)
							speed = 300
						}
					})
					
					if (speed !== 'slow')
						tooltip.css('top', panel.options.tooltip_show_bottom)
					
					tooltip.stop(true, true).animate({opacity: 'show', top: panel.options.tooltip_show_bottom}, speed)
				},
				// on mouse roll out - hide 
				function()
				{
					tooltip.animate({opacity: "hide", top: panel.options.tooltip_hide_bottom}, "fast")
				}
			)
		})
	},
	
	// initialize panel
	initialize: function()
	{
		this.activate_buttons(this.options.images_path)
		//this.activate_tooltips()
	
		if (пользователь)
		{
			this.initialize_new_talk_messages_indication()
			this.initialize_news_feed_indication()
			this.initialize_new_discussion_messages_indication()
			this.initialize_new_chat_messages_indication()
			
			//this.buttons.мусорка.element.parent().show()
			//this.buttons.мусорка.tooltip.update_position()
			
			var loading_indicator = $('#panel_menu > li > .loading')
			var opacity = loading_indicator.css('opacity')
			
			this.loading =
			{
				show: function() { loading_indicator.css('opacity', opacity) },
				hide: function() { loading_indicator.css('opacity', 0) }
			}
		}

		//this.new_news.bind(this).delay(1000)
		
		$('#panel').children().disableTextSelect()
	},
	
	highlight_current_page: function()
	{
		var panel = this
		
		var previously_highlighted_menu_item = panel.highlighted_menu_item
		
		function highlight_current_page_button(page_button)
		{
			if (previously_highlighted_menu_item && page_button === previously_highlighted_menu_item)
				return
			
			panel.toggle_buttons
			({
				type: page_button,
				fade_in_duration: 0,
				fade_out_duration: 0,
				show: { button: { current: true } }
			})
			
			panel.highlighted_menu_item = page_button
			
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
				
			return true
		}
	
		var page_button = get_page_button()
		
		if (page_button)
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
			
			if (options.new || есть_ли_новости(type))
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
			
			return this.buttons[type + postfix].element
		}
		.bind(this)
		
		var get_hidden_button = function () { return get_button(options.hide ? options.hide.button : {}) }
		var get_shown_button = function () { return get_button(options.show ? options.show.button : {}) }
		
		var get_buttons_to_hide = function()
		{
			var hide_buttons = []
			
			get_hidden_button().parent().children().each(function()
			{
				if (this !== get_shown_button().node())
					hide_buttons.push($(this))
			})
			
			return hide_buttons
		}
			
		var activate = function(these_options)
		{
			options = Object.merge(options, these_options)
				
			get_shown_button().css('z-index', 0)
			
			if (options.immediate)
			{
				get_buttons_to_hide().for_each(function()
				{
					this.hide()
				})
				
				get_shown_button().show().css('opacity', 1)
			}
			else
			{
				get_shown_button().fade_in(options.fade_in_duration)
				
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
		
		if (options.activation_name)
		{
			this[options.activation_name] = activate
			this[options.deactivation_name] = deactivate
		}
		else
		{
			//if (!options.fade)
			//	options.immediate = true
				
			activate()
		}
	},
	
	initialize_news_feed_indication: function(options)
	{
		options = options || {}
		
		this.toggle_buttons
		({
			type: 'новости',
			fade_in_duration: 2,
			fade_out_duration: 3,
			show:
			{
				button: { new: true }
			},
			activation_name: 'new_news',
			deactivation_name: 'no_more_new_news',
			immediate: options.immediate
		})
	},
	
	initialize_new_talk_messages_indication: function(options)
	{
		options = options || {}
	
		this.toggle_buttons
		({
			type: 'беседы',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			activation_name: 'new_talk_messages',
			deactivation_name: 'no_more_new_talk_messages',
			immediate: options.immediate
		})
	},
	
	initialize_new_discussion_messages_indication: function(options)
	{
		options = options || {}
	
		this.toggle_buttons
		({
			type: 'обсуждения',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			activation_name: 'new_discussion_messages',
			deactivation_name: 'no_more_new_discussion_messages',
			immediate: options.immediate
		})
	},
	
	initialize_new_chat_messages_indication: function(options)
	{
		options = options || {}
	
		this.toggle_buttons
		({
			type: 'болталка',
			fade_in_duration: 1,
			fade_out_duration: 1.5,
			show:
			{
				button: { new: true }
			},
			activation_name: 'new_chat_messages',
			deactivation_name: 'no_more_new_chat_messages',
			immediate: options.immediate
		})
	}
})