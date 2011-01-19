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
 *		panel.activate_buttons("/images/panel/menu")
 *		panel.activate_tooltips()
 * })
 * 
 * In filesystem:
 * 
 * create image sprites (60 pixels by 180 pixels in this example):
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * 		/images/panel/menu/home.png
 * 		/images/panel/menu/contacts.png
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

	var images_path = "images/panel/menu"
	
	var tooltip_show_bottom = 76
	var tooltip_hide_bottom = 86

	var icon_size = 60
	
	var tooltip_shifting_step = 70
	
	this.activate_buttons = function(images_path)
	{
		// for every panel menu item
		$("#" + menu_id + " > li").each(function()
		{
			var $menu_item = $(this)
			
			// initialize variables
			var title = $menu_item.attr("name");
			var link = $menu_item.attr("link");

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
			new image_button
			(
				$("> a", $menu_item), 
				{
					path: images_path,
					"button name": title,
					width: icon_size,
					height: icon_size
				}
			)
		})
	}
	
	this.activate_tooltips = function()
	{
		// for every tooltip
		$("#" + menu_id + " > li > a").each(function(index)
		{
			// get the tooltip and position it appropriately
			var tooltip = $(this).next(tooltip_tag)
			tooltip.css("left", tooltip_shifting_step * index + "px")
			
			$(this).hover
			(
				// on mouse roll over - show
				function() 
				{
					tooltip.stop(true, true).animate({opacity: "show", top: tooltip_show_bottom}, "slow")
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
		this.activate_buttons(images_path)
		this.activate_tooltips()
	} 
})()