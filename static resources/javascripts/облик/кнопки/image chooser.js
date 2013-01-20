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
	var $element = button.get_element(selector_or_element)
	this.$element = $element
	
	// the set of choosable images
	var choices = $("> [value]", $element)
	
	// the target (hidden input value container)
	this.target = $(options.target)
	
	// back reference
	var self = this
	
	this.choice_options = []
	
	// initialize each choosable image
	choices.each(function(index) 
	{
		var $this = $(this)
		
		// initialize choosable image
		var choice_option = new choosable_image
		(
			// choice
			$this,
			// options
			options
		)
		
		// set back reference
		choice_option.chooser = self
		
		self.choice_options.push(choice_option)
	})
	
	this.choose = function(choice)
	{
		// set the current choice
		this.choice = choice
		
		// set the target value
		this.target.val(this.choice.$element.attr("value"))
		
		if (options.on_choice)
			options.on_choice()
	}
	
	this.disable = function()
	{
		this.$element.addClass('disabled')
		
		this.choice_options.for_each(function()
		{
			this.disable()
		})
	}
	
	this.enable = function()
	{
		this.$element.removeClass('disabled')
		
		this.choice_options.for_each(function()
		{
			this.enable()
		})
	}

	this.reset = function()
	{
		// if anything is selected - unselect it
		if (this.choice)
			this.choice = null
			
		this.choice_options.forEach(function(choice)
		{
			choice.reset()
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
			if (this.chooser.choice)
			{
				// if this option is currently chosen - exit
				if (this.chooser.choice === this)
					return
				// else - reset the previously selected option
				else
				{
					//this.chooser.choice.let_unlock()
					//this.chooser.choice.fade_out('pushed')
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
		if (this.chooser.choice)
			if (this.chooser.choice !== this)
				this.chooser.choice.fade_out('pushed')
				
		this.parent()
	},
	
	on_roll_over: function()
	{
		if (this.chooser.choice === this)
			return

		this.parent()
	},
	
	on_roll_out: function()
	{
	/*
		// if some option is currently chosen
		if (this.chooser.choice != null)
			// if this option is currently chosen - exit
			if (this.chooser.choice === this)
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
