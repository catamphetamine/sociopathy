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
	
	insert: function(what, caret)
	{
		caret = caret || this.caret()
	
		if (what instanceof jQuery)
			caret.insertNode(what.get(0))
		else
			caret.insertNode(what)
	},
	
	insert: function(what)
	{
		if (typeof(what) === 'string')
			return this.insert_html(what)
			
		if (what instanceof jQuery)
			return this.insert_html(what.outer_html())
		
		throw 'Unexpected argument type'
	},
	
	insert_html: function(html)
	{
		var container = this.get_native_container()
		var caret_offset = this.caret_offset()
		
		if (!Dom_tools.is_text_node(container))
			return 'Unpredicted scenario in function insert_html'
		
		var text = container.nodeValue
		
		var before = text.substring(0, caret_offset)
		var after = text.substring(caret_offset)
		
		var parent = container.parentNode
			
		var node_chain = [parent]
		var how_much_parent_tags_to_close = html.count('</')	
		while (how_much_parent_tags_to_close > 0)
		{
			parent = parent.parentNode
			node_chain.push(parent)
			how_much_parent_tags_to_close--
		}
		
		node_chain.reverse()
		
		var before_and_after = Dom_tools.get_html_before_and_after(container)
		
		html = before_and_after.before +
			before +
			html +
			after + 
			before_and_after.after
		
		Dom_tools.inject_html(html, node_chain)
	},
	
	'delete': function()
	{
		this.selection().deleteContents()
	},
	
	wrap: function(element)
	{
		if (element instanceof jQuery)
			element = element[0]
			
		this.selection().surroundContents(element)
	},
	
	has_container: function(filter)
	{
		var container = this.get_container(filter)
		return container.length !== 0
	},
	
	get_container: function(filter)
	{
		var container = this.get_native_container()
		return $(container).parents(filter).filter(':first')
	},
	
	get_native_container: function()
	{
		return this.range().commonAncestorContainer
	},
	
	move_caret_to: function(element)
	{		
		if (element instanceof jQuery)
			element = element[0]

		var range = document.createRange()
		range.setStart(element, 0)
		range.collapse(true)
		
		this.apply_range(range)
		return range
	},
	
	move_caret_to_the_end_of: function(element)
	{		
		if (element instanceof jQuery)
			element = element[0]

		var range = document.createRange()
		range.setStartAfter(element)
		range.collapse(true)
		
		this.apply_range(range)
		return range
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
			
		if (this.caret_offset(caret) > 0)
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
			
		var range = caret.cloneRange()
		range.selectNodeContents(Dom_tools.get_last_child(this.get_container().get(0)))
		
		if (this.caret_offset(caret) < range.endOffset)
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
	
	caret_offset: function(caret)
	{
		if (!caret)
			caret = this.caret()
		return caret.startOffset
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
	},
	
	deselect: function()
	{
		window.getSelection().removeAllRanges()
	}
})