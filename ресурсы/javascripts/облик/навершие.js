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
			$('<em/>').append($menu_item.contents()).appendTo($menu_item)

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
		this.activate_tooltips()
	
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
		
		function check_for_current_page(options)
		{
			if (options.page)
				if (!Страница.is(options.page))
					return
			
			if (options.page_pattern)
				if (!Страница.matches(options.page_pattern))
					return
			
			if (previously_highlighted_menu_item && options.button === previously_highlighted_menu_item)
				return
			
			panel.toggle_buttons
			({
				hide:
				{
					button: { title: options.button },
					fade_in_duration: 0,
					fade_out_duration: 1
				},
				show:
				{
					button: { title: options.button + ' (выбрано)' },
					fade_in_duration: 0.1,
					fade_out_duration: 0.1
				},
				//fade: true
			})
			
			panel.highlighted_menu_item = options.button
			
			if (previously_highlighted_menu_item)
				panel.toggle_buttons
				({
					hide:
					{
						button: { title: previously_highlighted_menu_item + ' (выбрано)' },
						fade_in_duration: 0.1,
						fade_out_duration: 0.1
					},
					show:
					{
						button: { title: previously_highlighted_menu_item },
						fade_in_duration: 0,
						fade_out_duration: 1
					},
					//fade: true
				})
				
			return true
		}
		
		var checks =
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
			
			{ page: 'человек/дневник', button: 'дневник' },
			{ page: 'человек/запись в дневнике', button: 'дневник' },
			
			{ page: 'человек/журнал', button: 'журнал' },
			{ page: 'человек/запись в журнале', button: 'журнал' },
			
			{ page: 'человек/книги', button: 'книги' },
			
			{ page: 'человек/картинки', button: 'люди' },
			{ page: 'человек/альбом с картинками', button: 'люди' },
			{ page: 'человек/видео', button: 'люди' },
			{ page: 'человек/альбом с видео', button: 'люди' },
			
			{ page: 'сеть/круги', button: 'круги' },
			{ page: 'сеть/настройки', button: 'настройки' },
			{ page: 'сеть/мусорка', button: 'мусорка' },
			
			{ page: 'управление', button: 'управление' }
		]
		
		var i = 0
		while (i < checks.length)
		{
			if (check_for_current_page(checks[i]))
				break
			i++
		}
	},

	toggle_buttons: function(options)
	{
		if (!this.buttons[options.hide.button.title])
			return console.log('No button to hide: ' + options.hide.button.title)
	
		if (!this.buttons[options.show.button.title])
			return console.log('No button to show: ' + options.show.button.title)
			
		var hide_button = this.buttons[options.hide.button.title].element
		var show_button = this.buttons[options.show.button.title].element
		
		show_button.css
		({
			position: 'absolute',
			'z-index': -1,
			opacity: 0
		})
		
		hide_button.parent().append(show_button)
		
		var activate = function(these_options)
		{
			options = Object.merge(options, these_options)
			
			show_button.css('z-index', 0)
			
			if (options.immediate)
			{
				hide_button.hide()
				show_button.show().css('opacity', 1)
			}
			else
			{
				show_button.fade_in(options.show.fade_in_duration)
				hide_button.fade_out(options.hide.fade_out_duration)
			}
		
			panel.buttons[options.show.button.title].tooltip.update_position()
		}
		
		var deactivate = function(these_options)
		{
			options = Object.merge(options, these_options)
		
			show_button.css('z-index', -1)
			
			if (options.immediate)
			{
				show_button.hide()
				hide_button.show().css('opacity', 1)
			}
			else
			{
				hide_button.fade_in(options.hide.fade_in_duration)
				show_button.fade_out(options.show.fade_out_duration)
			}
		}
		
		if (options.activation_name)
		{
			this[options.activation_name] = activate
			this[options.deactivation_name] = deactivate
		}
		else
		{
			if (!options.fade)
				options.immediate = true
			activate()
		}
	},
	
	initialize_news_feed_indication: function(options)
	{
		options = options || {}
		
		this.toggle_buttons
		({
			hide:
			{
				button: { title: 'новости' },
				fade_in_duration: 0.5,
				fade_out_duration: 3
			},
			show:
			{
				button: { title: 'новости (непрочитанные)' },
				fade_in_duration: 2,
				fade_out_duration: 1
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
			hide:
			{
				button: { title: 'беседы' },
				fade_in_duration: 0.5,
				fade_out_duration: 1
			},
			show:
			{
				button: { title: 'беседы (непрочитанные)' },
				fade_in_duration: 1,
				fade_out_duration: 1
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
			hide:
			{
				button: { title: 'обсуждения' },
				fade_in_duration: 0.5,
				fade_out_duration: 1.5
			},
			show:
			{
				button: { title: 'обсуждения (непрочитанные)' },
				fade_in_duration: 1,
				fade_out_duration: 1
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
			hide:
			{
				button: { title: 'болталка' },
				fade_in_duration: 0.5,
				fade_out_duration: 1.5
			},
			show:
			{
				button: { title: 'болталка (непрочитанные)' },
				fade_in_duration: 1,
				fade_out_duration: 1
			},
			activation_name: 'new_chat_messages',
			deactivation_name: 'no_more_new_chat_messages',
			immediate: options.immediate
		})
	}
})