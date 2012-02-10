/**
 * Image Chooser
 * 
 * This script creates eye-candy image chooser with smooth animated hover and click effects.
 * 
 * Requires: jQuery, MooTools, Image Button. 
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var image_chooser = function(selector_or_element, options)
{
	// get the element
	var $element = get_element(selector_or_element)
	
	// the set of choosable images
	var choises = $("span[value]", $element)
	
	// the target (hidden input value container)
	this.target = $(options.target)
	
	// back reference
	var self = this
	
	this.choise_options = []
	
	// initialize each choosable image
	choises.each(function(index) 
	{
		var $this = $(this)
		
		// initialize choosable image
		var choise_option = new choosable_image
		(
			// choise
			$this,
			// options
			options
		)
		
		// set back reference
		choise_option.chooser = self
		
		self.choise_options.push(choise_option)
	})
	
	this.choose = function(choise)
	{
		// set the current choise
		this.choise = choise
		
		// set the target value
		this.target.val(this.choise.$element.attr("value"))
		
		if (options.on_choise)
			options.on_choise()
	}

	this.reset = function()
	{
		// if anything is selected - unselect it
		if (this.choise)
			this.choise = null
			
		this.choise_options.forEach(function(choise)
		{
			choise.reset()
		})

		// reset the target value			
		this.target.val('')
	}
}

var choosable_image = new Class
({
	Extends: image_button,
	
	initialize: function(id_or_element, options)
	{
		options.action = function()
		{
			// if some option is currently chosen
			if (this.chooser.choise)
			{
				// if this option is currently chosen - exit
				if (this.chooser.choise === this)
					return
				// else - reset the previously selected option
				else
				{
					//this.chooser.choise.let_unlock()
					//this.chooser.choise.fade_out('pushed')
					//this.fade_in('pushed')
				}
			}
			
			this.chooser.choose(this)
		}
		.bind(this)
		
		options['pushed frame fade in duration'] = 0.3
		options['pushed frame fade out duration'] = 0.3

		this.parent(id_or_element, options)
		//this.parent(id_or_element, Object.merge(options, { 'auto unlock': false }))
	},
	
	on_push: function()
	{
		if (this.chooser.choise)
			if (this.chooser.choise !== this)
				this.chooser.choise.fade_out('pushed')
				
		this.parent()
	},
	
	on_roll_over: function()
	{
		if (this.chooser.choise === this)
			return

		this.parent()
	},
	
	on_roll_out: function()
	{
	/*
		// if some option is currently chosen
		if (this.chooser.choise != null)
			// if this option is currently chosen - exit
			if (this.chooser.choise === this)
				return
	*/
	
		this.parent()
	},
	
	/*
	on_push: function()
	{
	},
	*/
	
	unpush: function()
	{
		this.can_unlock_the_pushing_lock()
	}
 })
