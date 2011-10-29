/*
 * Caret
 */
Editor.Caret = new Class
({
	initialize: function(editor)
	{
		this.editor = editor
	},

	get: function()
	{
		return this.editor.range()
	},
	
	has_container: function(filter)
	{
		var container = this.container(filter)
		return container.length !== 0
	},
	
	container: function(filter)
	{
		var container = this.native_container()
		return $(container).parents(filter).filter(':first')
	},
	
	native_container: function()
	{
		return this.get().commonAncestorContainer
	},
	
	move_to: function(element)
	{		
		if (element instanceof jQuery)
			element = element[0]

		var range = this.editor.create_range()
		range.setStart(element, 0)
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		return range
	},
	
	move_to_the_end_of: function(element)
	{		
		if (element instanceof jQuery)
			element = element[0]

		var range = this.editor.create_range()
		range.setStartAfter(element)
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		return range
	},
	
	move_to_container_end: function(filter)
	{
		var range = this.editor.create_range()
		range.setStartAfter(this.container(filter).get(0))
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		return range
	},
	
	move_to_container_start: function(filter)
	{
		var range = this.editor.create_range()
		range.setStartBefore(this.get_container(filter).get(0))
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		return range
	},
	
	is_in_the_beginning_of_container: function(filter)
	{
		var caret = this.get()
		
		if (!caret.collapsed)
			return false
			
		if (!Dom_tools.is_first_element(caret.startContainer, this.container(filter).get(0)))
			return false
			
		if (this.offset(caret) > 0)
			return false
			
		return true
	},
	
	is_in_the_end_of_container: function(filter)
	{
		var caret = this.get()
					
		if (!caret.collapsed)
			return false

		if (!Dom_tools.is_last_element(caret.startContainer, this.container(filter).get(0)))
			return false
			
		var range = caret.cloneRange()
		range.selectNodeContents(Dom_tools.get_last_child(this.container().get(0)))
		
		if (this.offset(caret) < range.endOffset)
			return false
			
		return true
	},
	
	offset: function(caret)
	{
		if (typeof(caret) === 'number')
		{
			var offset = caret
			caret = this.get()
			caret.setStart(caret.startContainer, offset)
			this.editor.collapse(caret)
			return
		}
		
		if (!caret)
			caret = this.get()
			
		return caret.startOffset
	},
	
	position: function(container, offset)
	{
		var caret = this.get()
		caret.setStart(container, offset)
		this.editor.collapse(caret)
	},
	
	text_before_and_after: function()
	{
		var container = this.native_container()
		var offset = this.offset()
		
		if (!Dom_tools.is_text_node(container))
			return 'Unpredicted scenario in function insert_html'
		
		var text = container.nodeValue
		
		var result =
		{
			before: text.substring(0, offset),
			after: text.substring(offset)
		}
		
		return result
	}
})