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
		return container
	},
	
	container: function(filter)
	{
		var container = this.node()
		
		if (!Dom_tools.is_text_node(container))
		{
			if ($(container).is(filter))
				return $(container)
		}
		
		return $(container).find_parent(filter, this.editor.content)
	},
	
	node: function()
	{
		return this.get().commonAncestorContainer
	},
	
	really_textual_container: function()
	{
		return Dom_tools.down_to_text_node(this.node())
	},
	
	caret_position: function()
	{
		var offset = this.offset()
		var node = this.node()
		var container
		
		var caret = this
		var editor = this.editor
		
		var defaults = function()
		{
			offset = 0
			node = Dom_tools.down_to_text_node(editor.content)
			
			if (node)
			{
				caret.move_to(node)
				
				var result =
				{
					container: $(node.parentNode),
					node: node,
					offset: 0,
					textual: true
				}
				
				return result
			}
			
			node = editor.content.node()
			offset = node.childNodes.length
			
			caret.move_to(node, offset)
				
			var result =
			{
				container: $(node),
				node: node,
				offset: offset,
				textual: false
			}
			
			return result
		}
		
		if (node)
		{
			if (Dom_tools.is_text_node(node))
				container = $(node.parentNode)
			else
				container = $(node)
			
			if (!container.belongs_to(editor.content))
			{
				return defaults()
			}
		}
		else
		{
			return defaults()
		}
		
		var result =
		{
			container: container,
			node: node,
			offset: offset,
			textual: Dom_tools.is_text_node(node)
		}
		
		return result
	},

	move_to: function(the_element, offset, options)
	{
		if (typeof offset === 'object')
		{
			options = offset
			offset = 0
		}
		
		options = options || {}
		
		the_element = Dom_tools.normalize(the_element)
		var element = the_element
	
		if (!offset)
			offset = 0
		
		/*
		if (!Dom_tools.is_text_node(element))
			element = Dom_tools.find_text_node(element, this.editor.content)
		
		if (!element)
		{
			element = document.createTextNode(' ')
			the_element.parentNode.appendChild(element)
		}
		*/
		
		if (options.to_the_end)
		{
			if (Dom_tools.is_text_node(element))
				offset = element.nodeValue.length
			else
				offset = element.childNodes.length
		}
		
		if (options.after)
		{
			if (!Dom_tools.is_text_node(element))
			{
				offset = Dom_tools.get_child_index(element) + 1
				element = element.parentNode
			}
		}
				
		//if (!element.nodeValue)
		//	element.nodeValue = ' '
			
		if ($.browser.webkit)
		{
			//if (!options.to_the_end)
			//	offset = offset + 1
		
			// просто на offset - не встаёт
			return this.create(element, offset)
		}

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

		var container = this.container(filter).get(0)
		
		if (!Dom_tools.is_first_element(caret.startContainer, container))
			return false
		
		var offset = this.offset(caret)
		
		// chrome bug
		if ($.browser.webkit)
			offset--
		
		if (offset !== 0)
			return false
			
		return true
	},
	
	is_in_the_end_of_container: function(filter)
	{
		var caret = this.get()
					
		if (!caret.collapsed)
			return false

		var container = this.container(filter).get(0)
			
		if (!Dom_tools.is_last_element(caret.startContainer, container))
			return false
			
		var range = caret.cloneRange()
		range.selectNodeContents(Dom_tools.get_last_descendant(container))
		
		if (this.offset(caret) < range.endOffset)
		{
			// chrome bug
			if ($.browser.chrome &&
				this.offset(caret) + 1 === range.endOffset)
			{
				// then skip
			}
			else
				return false
		}
			
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
	
	position_at: function(offset)
	{
		this.position(this.node(), offset)
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
		var caret_position = this.caret_position()
		
		var container = caret_position.node
		var offset = caret_position.offset
		
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
	
	move_to_the_next_element: function(relative_element, till)
	{
		var next = Dom_tools.find_next_text_node(relative_element, till)
		
		if (next && next.parentNode !== this.editor.content.node())
		{
			this.move_to(next)
			return next
		}
		
		//this.move_to(relative_element)
		return false
	},
	
	move_to_the_end_of: function(element)
	{
		return this.move_to_the_end(element)
	},
	
	move_to_the_end: function(element)
	{
		element = Dom_tools.normalize(element)
		
		if (Dom_tools.is_text_node(element))
			return this.position(element, element.nodeValue.length)
			
		if (!element.childNodes.length)
			return
			
		//this.position(element, element.childNodes.length)
		this.move_to(element.childNodes[element.childNodes.length - 1], { to_the_end: true })
	},
	
	text: function()
	{
		return this.node().nodeValue.substring(0, this.offset())
	},
	
	collapse_recent_characters: function(how_much, into)
	{
		var container = this.node()
		var offset = this.offset()
		
		container.nodeValue =
			container.nodeValue.substring(0, offset - how_much) + into +
			container.nodeValue.substring(offset, container.nodeValue.length)
			
		this.position(container, offset - how_much + into.length)
	},
	
	inside: function(selector)
	{
		var container = this.container()
		if (container.is(this.editor.content_selector + ' ' + selector))
			return true

		return container.parents(this.editor.content_selector + ' ' + selector).exists()
	},
	
	store: function()
	{
		this.editor.data.caret = this.get()
		return this.editor.data.caret
	},
	
	restore: function()
	{
		var caret = this.editor.data.caret
		if (!caret)
			return// console.error('Nothing to restore')

		if ($.browser.mozilla)
			this.editor.content.focus()
		
		this.editor.caret.set(caret)
		
		delete this.editor.data.caret
		return caret
	},
	
	root: function()
	{
		if (this.node() === this.editor.content.node())
			return true
		
		return this.container().node() === this.editor.content.node()
	}
})