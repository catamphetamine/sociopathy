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
	
	set: function(caret)
	{
		this.editor.apply_range(caret)
		
		/*
		var range = this.editor.create_range()
		range.setStart(caret.startContainer, caret.startOffset)
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		*/
	},
	
	has_container: function(filter)
	{
		var container = this.container(filter)
		return container.length !== 0
	},
	
	container: function(filter)
	{
		var container = this.native_container()
		return $(container).find_parent(filter)
	},
	
	native_container: function()
	{
		return this.get().commonAncestorContainer
	},
	
	native_textual_container: function()
	{
		return Dom_tools.down_to_text_node(this.native_container())
	},

	move_to: function(the_element, offset)
	{
		the_element = Dom_tools.normalize(the_element)
		var element = the_element
	
		if (!offset)
			offset = 0
		
		if (!Dom_tools.is_text_node(element))
			element = Dom_tools.find_text_node(element, this.editor.content)
		
		if (!element)
		{
			element = document.createTextNode(' ')
			the_element.parentNode.appendChild(element)
		}
		
		if ($.browser.webkit)
			return this.create(element, offset)

		var caret = this.get()
		if (caret)
		{
			caret.setStart(element, offset)
			this.editor.collapse(caret)
			return caret
		}
		else
			return this.create(element, offset)
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
		
		if (!Dom_tools.is_first_element(caret.startContainer, this.container(filter)))
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
			
			if (!caret)
				throw 'Caret is in invalid state'
			
			caret.setStart(caret.startContainer, offset)
			this.editor.collapse(caret)
			
			this.editor.apply_range(caret)
			return
		}
		
		if (!caret)
			caret = this.get()
			
		return caret.startOffset
	},
	
	create: function(container, offset)
	{
		if (!container)
			container = this.editor.content
			
		container = Dom_tools.normalize(container)
			
		if (!offset)
			offset = 0
	
		var range = this.editor.create_range()
		range.setStart(container, offset)
		this.editor.collapse(range)
		this.editor.apply_range(range)
		return range
	},
	
	position: function(container, offset)
	{
		if ($.browser.webkit)
			return this.create(container, offset)
		
		var caret = this.get()
		
		if (!caret)
			return this.create(container, offset)
			
		if (Dom_tools.is_text_node(container))
		{
			caret.setStart(container, offset)
			return this.editor.collapse(caret)
		}
		
		//throw 'Not a text node'
		
		caret.setStart(container, offset)
		this.editor.collapse(caret)
		
		/*
		if (container.childNodes.length === 0)
			throw 'illegal state'
			
		if (container.childNodes.length === 1)
		{
			caret.setStart(container, 0)
			this.editor.collapse(caret)
		}
		else
		{
			this.position_after(container.childNodes[offset - 1])
		}
		*/
	},
	
	/*
	position_after: function(element)
	{
		element = Dom_tools.normalize(element)

		var range = this.editor.create_range()
		range.setStartAfter(element)
		this.editor.collapse(range)
		
		this.editor.apply_range(range)
		return range
	},
	*/
	
	text_before_and_after: function()
	{
		var container = this.native_textual_container()
		var offset = this.offset()
		
		if (!Dom_tools.is_text_node(container))
			throw 'Unpredicted scenario in function insert_html'
		
		var text = container.nodeValue
		
		if (!text)
			return { before: '', after: '' }
		
		var result =
		{
			before: text.substring(0, offset),
			after: text.substring(offset)
		}
		
		return result
	},
	
	move: function()
	{
		this.offset(this.offset() + 1)
	},
	
	move_to_the_next_element: function(relative_element)
	{
		return this.move_to(Dom_tools.down_to_text_node(Dom_tools.next(relative_element)))
	},
	
	move_to_the_end: function(element)
	{
		element = Dom_tools.normalize(element)
		
		if (Dom_tools.is_text_node(element))
			return this.position(element, element.nodeValue.length)
			
		this.position(element, element.childNodes.length)
	},
	
	text: function()
	{
		return this.native_container().nodeValue
	},
	
	collapse_recent_characters: function(how_much, into)
	{
		var container = this.native_container()
		container.nodeValue = container.nodeValue.substring(0, container.nodeValue.length - how_much) + into
		this.move_to_the_end(container)
	},
	
	inside: function(selector)
	{
		var container = this.container()
		if (container.is(this.editor.content_selector + ' ' + selector))
			return true

		return container.parents(this.editor.content_selector + ' ' + selector).exists()
	}
})