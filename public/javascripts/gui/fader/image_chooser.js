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
 *	$(document).ready(function()
 *	{
 *		image_chooser.activate
 *		(
 *			"chooser", 
 *			{
 *				path: "/images/fruits",
 *				width: 100,
 *				height: 100,	
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
 * create images (100 pixels by 100 pixels, in this example):
 * 
 * 		/images/fruits/apples.png
 * 		/images/fruits/apples ready.png 
 * 		/images/fruits/apples pushed.png
 *  
 * 		/images/fruits/bananas.png
 * 		/images/fruits/bananas ready.png 
 * 		/images/fruits/bananas pushed.png
 * 
 * Requires jQuery, Image Button Fader. 
 * 
 * Distributed under GNU General Public License
 * http://www.gnu.org/licenses/gpl.html
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

image_chooser = function()
{
	this.state = {a: 1}
	
	this.activate = function(id, _)
	{
		var chooser = $("#" + id)
		var choises = $("span[value]", chooser)
		
		this.target = $("#" + _['target'])
		
		var it = this
		
		choises.each(function(index) 
		{
			_['button name'] = $(this).attr("name")
			image_button_fader.activate
			(
				$(this), 
				_, 
				{ 
					action: $.bind(it, it.choose),
					"on mouse over": $.bind(it, it.on_mouse_over),
					"on mouse out": $.bind(it, it.on_mouse_out), 
					"on push": $.bind(it, it.on_push) 
				}
			)
		})
	}
	
	this.on_mouse_over = function(_)
	{
		// if some option is currently chosen
		if (this.state.chosen_pushed)
			// if this option is currently chosen - do nothing
			if (this.state.chosen_pushed === _['pushed frame'])
				return

		// show the activation frame
		button_fader.fade_in(_['ready frame'])
	}

	this.on_mouse_out = function(_)
	{
		// if some option is currently chosen
		if (this.state.chosen_pushed)
			// if this option is currently chosen - do nothing
			if (this.state.chosen_pushed === _['pushed frame'])
				if (this.state.clear_ready_frame)
					this.state.clear_ready_frame = false
				else 
					return
		
		// hide the activation frame
		button_fader.fade_out(_['ready frame'])
	}
	
	this.on_push = function(_)
	{
		if (this.state.chosen_pushed !== _['pushed frame'])
		{
			if (this.state.chosen_pushed)
				button_fader.fade_out(this.state.chosen_pushed)
				
			button_fader.fade_in(_['pushed frame'])
			this.state.chosen_pushed = _['pushed frame']
			this.state.clear_ready_frame = true
		}				
	}
	
	this.choose = function(button)
	{
		this.target.val(button.attr("value"))
	}
	
	this.reset = function()
	{
		button_fader.fade_out(this.state.chosen_pushed)
		this.state.chosen_pushed = undefined
		
		this.target.val('')
	}
}
