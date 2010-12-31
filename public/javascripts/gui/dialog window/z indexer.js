/**
 * Dialog window manager
 * 
 * Controls all the opened dialog windows on the page
 * 
 * Requires MooTools.
 * 
 * Copyright (c) 2010 Nikolay Kuchumov
 * Licensed under MIT (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var z_indexer = new (function()
{
	// z-index
	this.top_z = 0
	
	/**
	 * retrieves current maximum z-index, so that the next maximum z-index will be (current + 1)
	 */
	this.acquire_top_z = function()
	{
		old_top_z = this.top_z
		this.top_z++
		return old_top_z
	}

	// all the opened dialog windows on the page
	var dialog_windows = []
	
	/**
	 * registers an opened dialog window
	 */
	this.register = function(dialog_window)
	{
		dialog_windows.push(dialog_window)
	}
	
	/**
	 * unregisters a closed dialog window
	 */
	this.unregister = function(dialog_window)
	{
		dialog_windows.remove(dialog_window)
		this.refresh_top_z()
	}
	
	/**
	 * retrieves the toppest dialog window
	 */
	this.get_top_dialog_window = function()
	{
		return dialog_windows[dialog_windows.length - 1]
	}
	
	/**
	 * refreshes current maximum z-index
	 */
	this.refresh_top_z = function()
	{
		this.top_z = this.calculate_top_z()
	}
	
	/**
	 * calculates current maximum z-index
	 */
	this.calculate_top_z = function()
	{
		var top_z = 0
		
		dialog_windows.each(function(dialog_window) 
		{
			top_z = Math.max(top_z, dialog_window.$element.css('z-index'))
		})
		
		return top_z
	}	
})()
