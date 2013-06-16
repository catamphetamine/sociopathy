/*
 * Editor
 */
var Editor = new Class
({
	event_handlers: [],
	
	data: {},
	
	initialize: function(content_selector)
	{
		this.content_selector = content_selector
		this.content = this.get_content()
		
		this.apply_content_style()
		
		this.caret = new Editor.Caret(this)
		this.selection = new Editor.Selection(this)
		this.time_machine = new Editor.Time_machine(this)

		this.on('paste', (function(event)
		{
			event.preventDefault()
			event.stopPropagation()
			
			var text = event.originalEvent.clipboardData.getData('text/plain')
			
			if (this.selection.exists() && this.selection.is_valid())
				this.selection.cut()
				
			this.insert(text)
		})
		.bind(this))
	},
	
	get_content: function()
	{
		return $(this.content_selector)
	},

	data: function(name, data)
	{
		if (typeof data === 'undefined')
		{
			if (!this.data_store)
				return
				
			return this.data_store[name]
		}
		
		if (!this.data_store)
			this.data_store = {}
			
		this.data_store[name] = data
	},

	on: function(event, handler)
	{
		this.event_handlers.push({ event: event, handler: handler })
		this.content.on(event, handler)
	},
	
	on_event: function(selector, event, handler)
	{
		this.event_handlers.push({ selector: selector, event: event, handler: handler })
		this.content.find(selector).on(event, handler)
	},
	
	apply_content_style: function()
	{
		this.content.css
		({
			outline: '0px solid transparent', // remove border in FireFox
			'white-space': 'pre-wrap'
		})
	},

	/*	
	reload_content: function()
	{
		this.load_content(this.content.outer_html())
	},
	
	load_content: function(html)
	{
		var parent = this.content.parent()
		this.content.remove()
		this.content = $(html).appendTo(parent)
		
		this.content.attr('contenteditable', true)
		this.focus()
	},
	*/
	
	reload_content: function()
	{
		this.load_content(this.content.html())
	},
	
	load_content: function(html)
	{
		this.content.html(html)
		this.apply_content_style()
	},
	
	set_content: function(html)
	{
		this.load_content(html)
	},
	
	refresh_content: function()
	{
		this.content = this.get_content()
		this.rebind()
	},
	
	rebind: function()
	{
		var editor = this
		this.event_handlers.forEach(function(rebound)
		{
			if (!rebound.selector)
				editor.content.on(rebound.event, rebound.handler)
			else
				editor.content.find(rebound.selector).on(rebound.event, rebound.handler)
		})
		
		//this.rebind_events()
	},
	
	//rebind_events: function() {},
	
	marker_attribute: 'mark',
	marker_attribute_value: 'temporary',
	get_marker_selector: function() { return '[' + this.marker_attribute + '=' + this.marker_attribute_value + ']' },
	get_marker_html: function() { return this.marker_attribute + '="' + this.marker_attribute_value + '"' },
	
	mark: function(element)
	{
		if (this.content.find(this.get_marker_selector()).length > 0)
			throw 'Some element is already marked'
			
		element.attr(this.marker_attribute, this.marker_attribute_value)
		return element
	},
	
	unmark: function(options)
	{
		options = options || {}
	
		var element = this.content.find(this.get_marker_selector())
		
		if (!element.exists())
		{
			if (!options.cant_retry)
			{
				this.refresh_content()
				return this.unmark({ cant_retry: true })
			}
			
			throw 'No marked element found'
		}
			
		if (element.length > 1)
			throw 'More than one element was marked'
		
		element.removeAttr(this.marker_attribute)
		return element
	},
	
	focus: function()
	{
		this.content.focus()
	},
	
	content_changed: function(options)
	{
		this.content_changed_on = now().getTime()
		this.content.trigger('content_changed', options || {})		
	},
	
	checkpoint: function()
	{
		this.continuous_typing = false
		this.content_changed()
	},
	
	was_content_changed: function()
	{
		if (this.content_changed_on)
			return true
		
		return false
	},
	
	can_be_empty: function(div)
	{
		//if (div.is('.tex'))
		//	return true
		
		if (div.is('.audio_player'))
			return true
		
		return false
	},
	
	doesnt_need_to_be_wrapped: function(what)
	{
		if (what.is('h2'))
			return true
		
		if (what.is('.citation'))
			return true
		
		if (what.is('ul'))
			return true
		
		if (what.is('.audio_player'))
			return true
		
		if (what.is('.video_player'))
			return true
		
		if (what.is('.tex'))
			if (!what.is('.tex[inline="true"]'))
				return true
			
		return false
	},
	
	insert: function(what, options)
	{
		options = options || {}
		
		var container
		
		if (this.caret.get())
		{		
			var caret_position = this.caret.caret_position()
			container = caret_position.container
			
			if (container.hasClass('hint'))
			{
				container.removeClass('hint')
				options.replace = true
			}
		}
		
		if (typeof(what) === 'string')
		{
			if (this.time_machine.can_snapshot_typing())
				this.time_machine.snapshot()
			
			if (container)
			{
				this.insert_text(what, options)
			
				if ($.browser.webkit)
				{
					if (!Dom_tools.is_text_node(container.node().firstChild))
						if ($(container.node().firstChild).is('br'))
							$(container.node().firstChild).remove()
				}
			}
			else
			{
				this.load_content('<p></p>')
				var paragraph = $(this.get_content().children()[0])
				
				paragraph.text(what)
				this.caret.move_to(paragraph)
			}
			
			this.content_changed()
			
			if (!this.continuous_typing)
				this.continuous_typing = true
		
			return
		}
			
		if (what instanceof jQuery)
		{
			if (container)
			{
				this.time_machine.snapshot()
				
				var container_tag = container.node().tagName.toLowerCase()
				
				this.mark(what)
				
				if (options.replace)
				{
					var node = caret_position.node
					Dom_tools.replace(node, what.node())
					
					this.sanitize()
					
					return this.unmark()
				}
				
				var html
				if (options.break_container && container.node() !== this.content.node())
					html = '</' + container_tag + '>' + what.outer_html() + '<' + container_tag + '>'
				else
					html = what.outer_html()
				
				this.insert_html(html)
					
				this.checkpoint()
				var element = this.unmark()
				
				if ($.browser.webkit)
				{
					if (element.parent().node() === this.content.node())
					{
						if (!this.doesnt_need_to_be_wrapped(element))
						{
							container = $('<p/>').appendTo(this.content)
							element.appendTo(container)
							
							this.content.find('> br').remove()
						}
					}
				}
					
				this.sanitize()
				
				return element
			}
			else
			{
				this.load_content('<p>' + what.outer_html() + '</p>')
				var paragraph = $(this.get_content().children()[0])
				
				this.caret.move_to(paragraph)
				
				this.sanitize()
				
				return element
			}
		}
		
		throw 'Unexpected argument type'
	},
	
	insert_text: function(inserted_text, options)
	{
		var caret_position = this.caret.caret_position()
		var caret_offset = caret_position.offset
		if (options.replace)
			caret_offset = 0
		
		var container = caret_position.node
		
		if (container === this.content.node())
		{
			container = $('<p/>').appendTo(this.content)
			container.text(inserted_text)
			this.caret.move_to_the_end_of(container)
			return
		}
		
		if (!Dom_tools.is_text_node(container))
		{
			var offset = caret_offset
				
			var text_container = container.childNodes[offset]
			
			if (!text_container || !Dom_tools.is_text_node(text_container))
			{
				var options = {}
				
				if (text_container)
					options.before = text_container
				
				text_container = Dom_tools.text(container, inserted_text, options)
				return this.caret.create(text_container, inserted_text.length)
			}
			
			if (!options.replace)
				text_container.nodeValue = inserted_text + text_container.nodeValue
			else
				text_container.nodeValue = inserted_text
			
			this.caret.create(text_container, inserted_text.length)
		}
		else
		{
			if (!options.replace)
			{
				var text = this.caret.text_before_and_after()
				container.nodeValue = text.before + inserted_text + text.after
			}
			else
				container.nodeValue = inserted_text
				
			caret = this.caret.get()
			if (!caret)
				caret = this.caret.create(container, caret_offset + inserted_text.length)
			else
				this.caret.offset(caret_offset + inserted_text.length)
		}
	},
	
	insert_html: function(html)
	{
		var caret_position = this.caret.caret_position()
		var container = caret_position.node
		
		var inner_html = { before: '', after: '' }
		
		if (caret_position.textual)
			inner_html = this.caret.text_before_and_after()
		else
		{
			var i = 0
			while (i < caret_position.offset)
			{
				inner_html.before += Dom_tools.outer_html(container.childNodes[i])
				i++
			}
			
			while (i < container.childNodes.length)
			{
				inner_html.after += Dom_tools.outer_html(container.childNodes[i])
				i++
			}
		}
		
		var parent
		if (container !== this.content[0])
			parent = container.parentNode
		
		var node_chain = []
		if (parent)
			node_chain.push(parent)
		
		function how_much_tags_to_close(html)
		{
			//return html.count('</') - html.count(/<[^\/]+/g)
		
			var opening_tags = 0
			var closing_tags = 0
			
			var left = html.substring(html.indexOf('<'))
			if (html.starts_with('</'))
			{
				if (opening_tags > 0)
					opening_tags--
				else
					closing_tags++
			}
			
			return closing_tags
		}
		
		var how_much_parent_tags_to_close = how_much_tags_to_close(html)
		
		while (how_much_parent_tags_to_close > 0)
		{
			parent = parent.parentNode
			node_chain.push(parent)
			how_much_parent_tags_to_close--
		}
		
		node_chain.reverse()
		
		var outer_html = { before: '', after: '' }
		if (parent)
			outer_html = Dom_tools.html_before_and_after(container)
		
		html = outer_html.before +
			inner_html.before +
			html +
			inner_html.after + 
			outer_html.after
			
		if (!node_chain.is_empty())
			Dom_tools.inject_html(html, node_chain)
		else
			container.innerHTML = html
	
		if (how_much_parent_tags_to_close > 0)
			this.refresh_content()
	},
	
	is_empty: function()
	{
		return this.content.text().trim().length === 0
	},
	
	range: function()
	{
		return Editor.range()
	},
	
	create_range: function()
	{
		return Editor.create_range()
	},
	
	collapse: function(range)
	{
		Editor.collapse_range(range)
	},
	
	get_selection: function()
	{
		return Editor.get_selection()
	},
	
	apply_range: function(range)
	{
		Editor.apply_range(range)
	},
	
	paste: function(what)
	{
		this.insert(what)
	},
	
	deselect: function()
	{
		Editor.deselect()
	},
	
	sanitize: function()
	{
		this.content.find('> br').remove()
		
		this.content.find('> p > br:first-child, > p > br:last-child').remove()
		
		this.content.find('> p').each(function()
		{
			//console.log($(this).outer_html())
			//console.log(this.childNodes.length)
			
			if (this.childNodes.length === 0)
				return $(this).remove()
			
			if (this.childNodes.length === 1)
			{
				if (Dom_tools.is_text_node(this.firstChild))
					if (this.firstChild.nodeValue.trim() == '')
						return $(this).remove()
			}
		})
		
		var editor = this
		
		this.content.find('> div').each(function()
		{
			var div = $(this)
			var children = div.children()
			
			if (children.length === 0)
				if (!editor.can_be_empty(div))
					return div.remove()
				
			if (children.length === 1)
				if ($(children[0]).is('br'))
					return div.remove()
		})
	},
	
	html: function()
	{
		this.sanitize()
		return this.content.html()
	}
})

Editor.deselect = function()
{
	window.getSelection().removeAllRanges()
}

Editor.create_range = function()
{
	return document.createRange()
}

Editor.collapse_range = function(range)
{
	range.collapse(true)
}

Editor.get_selection = function()
{
	return window.getSelection()
}

Editor.apply_range = function(range)
{
	var selection = Editor.get_selection()
	selection.removeAllRanges()
	selection.addRange(range)
}

Editor.move_caret_to_the_end_of_text = function(text_node)
{
	Editor.move_caret_to(text_node, text_node.nodeValue.length - 1)
}

Editor.move_caret_to = function(node, position)
{
	var range = Editor.create_range()
	range.setStart(node, position)
	Editor.collapse_range(range)
	Editor.apply_range(range)
}

Editor.range = function()
{
	if (this.get_selection().rangeCount === 0)
		return
		
	return this.get_selection().getRangeAt(0)
}

Editor.get_caret_position = function()
{
	return Editor.range().startOffset
}