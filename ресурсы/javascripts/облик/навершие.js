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
			
			// tooltip text
			var text_node = $menu_item.contents()

			// place the panel menu item
			var $hyperlink = $("<a/>")
			$hyperlink.appendTo($menu_item)
			$hyperlink.addClass('image')
			
			if (link)
				$hyperlink.attr('href', link)
			
			// tooltip
			$menu_item.append("<em></em>")
			
			// place the tooltip text
			$("em", $menu_item).append(text_node)
			
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
			$(document).find('body').append(tooltip)
			
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
	
		this.initialize_new_messages_indication()
		this.initialize_news_feed_indication()
		this.initialize_new_discussions_indication()

		//this.new_news.bind(this).delay(1000)
		
		$('#panel').children().disableTextSelect()
	},

	toggle_buttons: function(options)
	{
		var idle_button = this.buttons[options.idle.button.title].element
		var active_button = this.buttons[options.active.button.title].element
		
		active_button.css
		({
			position: 'absolute',
			'z-index': -1,
			opacity: 0
		})
		
		idle_button.parent().append(active_button)
		
		this.buttons[options.active.button.title].tooltip.update_position()
		
		this[options.activation_name] = function(these_options)
		{
			options = Object.merge(options, these_options)
			
			active_button.css('z-index', 0)
			
			if (options.immediate)
			{
				idle_button.hide()
				active_button.show().css('opacity', 1)
			}
			else
			{
				active_button.fade_in(options.active.fade_in_duration)
				idle_button.fade_out(options.idle.fade_out_duration)
			}
		}
		
		this[options.deactivation_name] = function(these_options)
		{
			options = Object.merge(options, these_options)
		
			active_button.css('z-index', -1)
			
			if (options.immediate)
			{
				active_button.hide()
				idle_button.show().css('opacity', 1)
			}
			else
			{
				idle_button.fade_in(options.idle.fade_in_duration)
				active_button.fade_out(options.active.fade_out_duration)
			}
		}
	},
	
	initialize_news_feed_indication: function(options)
	{
		options = options || {}
		
		this.toggle_buttons
		({
			idle:
			{
				button: { title: 'новости' },
				fade_in_duration: 0.5,
				fade_out_duration: 3
			},
			active:
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
	
	initialize_new_messages_indication: function(options)
	{
		options = options || {}
	
		this.toggle_buttons
		({
			idle:
			{
				button: { title: 'беседы' },
				fade_in_duration: 0.5,
				fade_out_duration: 1
			},
			active:
			{
				button: { title: 'беседы (непрочитанные)' },
				fade_in_duration: 1,
				fade_out_duration: 1
			},
			activation_name: 'new_messages',
			deactivation_name: 'no_more_new_messages',
			immediate: options.immediate
		})
	},
	
	initialize_new_discussions_indication: function(options)
	{
		options = options || {}
	
		this.toggle_buttons
		({
			idle:
			{
				button: { title: 'обсуждения' },
				fade_in_duration: 0.5,
				fade_out_duration: 1.5
			},
			active:
			{
				button: { title: 'обсуждения (непрочитанные)' },
				fade_in_duration: 1,
				fade_out_duration: 1
			},
			activation_name: 'new_discussions',
			deactivation_name: 'no_more_new_discussions',
			immediate: options.immediate
		})
	}
})