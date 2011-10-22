/*
var Modifier = new Class //(command, editDoc)
({
	apply: function(value)
	{
		editDoc.execCommand(command, false, value)
	},
	
	get_value: function()
	{
		return editDoc.queryCommandValue(command)
	},
	
	is_applied: function()
	{
		var value = this.getValue()
		return value !== null && typeof(value) !== 'undefined'
	}
})
*/

var Editor = new Class
({
	window: window,

	initialize: function()
	{
	},
	
	move_caret_to: function(element)
	{		
		element = element.get(0)
//		if (element.firstChild)
//			element = element.firstChild

		var range = document.createRange()
		range.setStart(element, 0)
		range.collapse(true)
		
		this.apply_range(range)
		return range
	},
	
	insert: function(what, caret)
	{
		caret = caret || this.caret()
	
		if (what instanceof jQuery)
			caret.insertNode(what.get(0))
		else
			caret.insertNode(what)
	},
	
	'delete': function()
	{
		this.selection().deleteContents()
	},
	
	wrap: function(element)
	{
		this.selection().surroundContents(element.get(0))
	},
	
	has_container: function(filter)
	{
		var container = this.get_container(filter)
		return container.length !== 0
	},
	
	get_container: function(filter)
	{
		var container = this.range().commonAncestorContainer
		return $(container).parents(filter)
	},
	
	move_caret_to_container_end: function(filter)
	{
		var range = document.createRange()
		range.setStartAfter(this.get_container(filter).get(0))
		range.collapse(true)
		
		this.apply_range(range)
		return range
	},
	
	move_caret_to_container_start: function(filter)
	{
		var range = document.createRange()
		range.setStartBefore(this.get_container(filter).get(0))
		range.collapse(true)
		
		this.apply_range(range)
		return range
	},
	
	is_caret_in_the_beginning_of_container: function(filter)
	{
		var caret = this.caret()
		
		if (!caret.collapsed)
			return false
			
		if (!Dom_tools.is_first_element(caret.startContainer, this.get_container(filter).get(0)))
			return false
			
		if (caret.startOffset > 0)
			return false
			
		return true
	},
	
	is_caret_in_the_end_of_container: function(filter)
	{
		var caret = this.caret()
					
		if (!caret.collapsed)
			return false

		if (!Dom_tools.is_last_element(caret.startContainer, this.get_container(filter).get(0)))
			return false
			
		//console.log("caret.startOffset = " + caret.startOffset)
		var range = caret.cloneRange()
		range.selectNodeContents(Dom_tools.get_last_child(this.get_container().get(0)))
		//console.log("other endOffset = " + range.endOffset)
		//console.log(range)
		if (caret.startOffset < range.endOffset)
			return false
			
		return true
	},
	
	apply_range: function(range)
	{
		var selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	},
	
	cut: function()
	{
		this.buffer = this.range().extractContents()
		return this.buffer
	},
	
	paste: function()
	{
		this.insert(this.buffer)
	},
	
	has_selection: function()
	{
		return !this.selection().collapsed
	},
	
	range: function()
	{
		return this.window.getSelection().getRangeAt(0)
	},
	
	selection: function()
	{
		return this.range()
	},
	
	caret: function()
	{
		return this.range()
	}
})