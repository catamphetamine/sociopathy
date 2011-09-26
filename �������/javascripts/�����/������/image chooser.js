/**
 * Image Chooser
 * 
 * This script creates eye-candy image chooser with smooth animated hover and click effects.
 * 
 * Usage:
 * 
 * In html:
 * 
 * <div id="chooser" class="float_centerer">
 *		<span name="apples" value="russian apples"></span>
 *		<span name="bananas" value="african bananas"></span>
 * 		
 * 		<hr class="float_centerer" />
 * 	</div>
 * 
 * <input type="hidden" id="chosen_fruit" value="['russian apples' or 'african bananas' will be placed here]"/>
 * 
 * In javascript:
 * 
 *	$(function()
 *	{
 *		new image_chooser
 *		(
 *			"chooser", 
 *			{
 *				target: "chosen_fruit"
 *			}
 *		)
 *	});
 *
 * In stylesheet:
 * 
 *	div.float_centerer
 *	{
 *		margin-left: auto;
 *		margin-right: auto;
 *
 *		display: table;
 *	}
 *
 *	hr.float_centerer
 *	{
 *		clear: left; 
 *		visibility: hidden;
 *	}
 *
 * In filesystem:
 * 
 * create image sprites (100 pixels by 300 pixels, in this example):
 * (frames (top to bottom): idle, ready, pushed)
 * 
 * 		/картинки/fruits/apples.png
 * 		/картинки/fruits/bananas.png
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

var image_chooser = function(id_or_element, options)
{
	// get the element
	var $element = get_element(id_or_element)
	
	// the set of choosable images
	var choises = $("span[value]", $element)
	
	// the target (hidden input value container)
	this.target = $("#" + options.target)
	
	// back reference
	var self = this
	
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
			$.extend
			(
				{
					'button name': $this.attr("name"),
					action: self.choose
				},
				options
			)
		)
		
		// set back reference
		choise_option.chooser = self
	})
	
	this.choose = function(choise)
	{
		// set the current choise
		this.choise = choise
		
		// set the target value
		this.target.val(this.choise.$element.attr("value"))
	}

	this.reset = function()
	{
		// if anything is selected - unselect it
		if (this.choise)
			this.choise = null

		// reset the target value			
		this.target.val('')
	}
}

var choosable_image = new Class
({
	Extends: image_button,
	
	initialize: function(id_or_element, options)
	{
		this.parent(id_or_element, Object.merge(options, { 'auto unlock': false }))
	},
	
	on_roll_over: function()
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
	
	on_push: function()
	{
		// if some option is currently chosen
		if (this.chooser.choise)
			// if this option is currently chosen - exit
			if (this.chooser.choise === this)
				return
			// else - reset the previously selected option
			else
			{
				this.chooser.choise.let_unlock()
				this.chooser.choise.unpush()
			}
				
		this.select()
		this.parent()
	},
	
	select: function()
	{
		this.chooser.choose(this)
	},
 })
