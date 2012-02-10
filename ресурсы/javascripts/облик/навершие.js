/**
 * Panel
 * 
 * This script creates top panel bar with clickable menu items having tooltips.
 * 
 * Usage:
 * 
 * in html:
 * 
 * 	<div id="panel">
 *		<ul id="panel_menu">
 *			<li name="home" link="/">
 *				go to Home page
 *			</li>
 *			<li name="contacts" link="/contacts/">
 *				view Contact information
 *			</li>
 *		</ul>
 *	</div>
 *
 * in javascript:
 * 
 * $(function()
 *	{
 *		panel.activate_buttons("/картинки/навершие/menu")
 *		panel.activate_tooltips()
 * })
 * 
 * In filesystem:
 * 
 * create image sprites (60 pixels by 180 pixels in this example):
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * 		/картинки/навершие/menu/home.png
 * 		/картинки/навершие/menu/contacts.png
 * 
 * Requires jQuery and Button Fader. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var panel = new (function()
{
	var menu_id = "panel_menu"
	var tooltip_tag = "em"

	var images_path = "/картинки/навершие/menu"
	
	var tooltip_show_bottom = 76
	var tooltip_hide_bottom = 86
	
	var delta_y = tooltip_hide_bottom - tooltip_show_bottom

	var icon_size = 60
	
	this.activate_buttons = function(images_path)
	{
		// for every panel menu item
		$("#" + menu_id + " > li").each(function()
		{
			var $menu_item = $(this)
			
			// initialize variables
			var title = $menu_item.attr("name");
			var link = $menu_item.attr("link");

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
				$("> a", $menu_item), 
				{
					skin: 'url(\'' + images_path + '/' + title + '.png' + '\')',
					width: icon_size,
					height: icon_size
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
		})
	}
	
	this.activate_tooltips = function()
	{
		var tooltips = []
		
		// for every tooltip
		$('#' + menu_id + ' > li > a').each(function()
		{
			// get the tooltip and position it appropriately
			var tooltip = $(this).next(tooltip_tag)
			tooltip.disableTextSelect()
			
			tooltips.push(tooltip)
			
			if (tooltip.parent().attr('not_yet_implemented'))
			{
				$(this).click(function(event) { event.preventDefault(); info('Ещё не сделано'); })
			}
			
			tooltip.css('left', ($(this).position().left + 10) + 'px')
			tooltip.addClass('panel_menu_tooltip')
			$(document).find('body').append(tooltip)
			
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
						tooltip.css('top', tooltip_show_bottom)
					
					tooltip.stop(true, true).animate({opacity: 'show', top: tooltip_show_bottom}, speed)
				},
				// on mouse roll out - hide 
				function()
				{
					tooltip.animate({opacity: "hide", top: tooltip_hide_bottom}, "fast")
				}
			)
		})
	}
	
	// initialize panel
	this.initialize = function()
	{			
		$('#panel').wrap('<div id="panel_container"/>').wrap('<div id="panel_box_shadow_fixer"/>')
		
		this.activate_buttons(images_path)
		this.activate_tooltips()
		
		$('#panel').children().disableTextSelect()
	} 
})()