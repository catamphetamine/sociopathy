/**
 * Slider
 * 
 * This script creates a slider from predefined div frames.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <div id="the_slider" class="slider">
 *		<div class="slide">
 *			La la la
 *		</div>
 *			
 *		<div class="slide">
 *			Vodka
 *		</div>
 * 	</div>
 *
 * In javascript:
 * 
 *	$(document).ready(function()
 *	{
 *		var the_slider = new slider
 *		({
 *			id: "the_slider",
 *			width: 560,
 *			height: 263,
 *			"previous button": $("#previous"),
 *			"next button": $("#next"),
 *			"done button": $("#done"),
 *			fader: button_fader, // if you have it included
 *		});
 *
 *		the_slider.activate();
 *	});
 *
 * The stylesheet is included ('slider.css')
 * 
 * Requires jQuery. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

function slider(_)
{
	this.index = 1
	
	this._ = _
	this.width = _['width']
	this.height = _['height']
		
	this.activate = function()
	{
		var slideshow = $('#' + _['id'])
		var slides = slideshow.children()
		this.count = slides.length

		// create the strip
		slides.wrapAll('<div id="strip" style="width: ' + this.width * this.count + 'px; height: ' + this.height + 'px"></div>')
		this.strip = $('#strip')

		// size the container
		slideshow.width(this.width)
		slideshow.height(this.height)
		
		// size the slides
		slides.width(this.width)
		slides.height(this.height)

		// adjust controls visibility
		this.hide_or_show_controls({ "no one sees": true })
	}
	
	// go to slide
	this.go_to = function(index)
	{
		// out of bounds. exit
		if (index < 1 || index > this.count)
			return
			
		// set index
		this.index = index
		
		// animate scrolling, refresh buttons
		this.animate()
		this.hide_or_show_controls()
	}
	
	// next slide
	this.next = function()
	{
		this.go_to(this.index + 1)
	}
	
	// previous slide
	this.previous = function()
	{
		this.go_to(this.index - 1)
	}
		
	// smoothly move the strip using margin-left
	this.animate = function()
	{	
		this.strip.animate
		({
			'marginLeft': -this.width * (this.index - 1)
		})
	};
	
	// Hides and shows controls depending on current position
	this.hide_or_show_controls = function(_)
	{
		// if no one sees - don't animate
		if (_ && _["no one sees"]) 
			this.no_animation = true
		
		// if there's only one slide - that's a special case
		if (this.count < 2)
			this.singleton()
		
		// determine whether we are at the beginning, ending or elsewhere
		if (this.index == 1)
			this.beginning()
		else if (this.index == this.count)
			this.ending()
		else
			this.elsewhere()

		// now someone may see, so animate
		this.no_animation = false
	}
	
	// if we are at the start
	this.beginning = function()
	{
		this.hide_button("previous button")
		this.switch_buttons({ from: "done button", to: "next button", delay: 2 })
	}

	// if we are in the end				
	this.ending = function()
	{
		this.show_button("previous button")
		this.switch_buttons({ from: "next button", to: "done button", delay: 2 })
	}
	
	// if we are elsewhere
	this.elsewhere = function()
	{
		this.show_button("previous button")
		this.switch_buttons({ from: "done button", to: "next button", delay: 2 })
	}
	
	// if there is only one slide		
	this.singleton = function()
	{
		this.hide_button("previous button")
		this.switch_buttons({ from: "next button", to: "done button", delay: 2 })
	}
	
	// show a button
	this.show_button = function(name, timing, callback)
	{
		this.show_hide_template(name, function(element) { element.show() }, this._["fader"].fade_in, timing, callback)
	}
	
	// hide a button
	this.hide_button = function(name, timing, callback)
	{
		this.show_hide_template(name, function(element) { element.hide() }, this._["fader"].fade_out, timing, callback)
	}
	
	// show / hide template
	this.show_hide_template = function(name, simple_show_hide, animated_show_hide, timing, callback)
	{
		// if there is no button to (show / hide) - exit
		if (!this._[name])
			return
		
		// if there is no button fader, or if it's the first time - don't animate, just (show / hide) the button
		if (!this._["fader"] || this.no_animation)
		{
			// just show / hide
			simple_show_hide(this._[name])
			
			// if there was any callback function - call it
			if (callback)
				callback()
				
			// exit
			return
		}
			
		// fade (in / out)
		animated_show_hide(this._[name], { timing: timing * this._["fader"].fading_time, callback: callback })
	} 
	
	// hide one button and show the other button
	this.switch_buttons = function(_)
	{
		// animation delay
		var delay = safely_get(_.delay, 0)
		
		// animate
		this.hide_button(_.from, delay, $.proxy(function() { this.show_button(_.to, 1) }, this))
	}
	
	// reset state
	this.reset = function()
	{
		this.index = 1
		this.strip.css('margin-left', 0)
		this.hide_or_show_controls({ "no one sees": true })
	}
}