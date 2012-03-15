/*
 * Editor
 */
var Editor = new Class
({
	event_handlers: [],
	
	initialize: function(content_selector)
	{
		this.content_selector = content_selector
		this.content = this.get_content()
		this.apply_content_style()
		
		this.caret = new Editor.Caret(this)
		this.selection = new Editor.Selection(this)
		this.time_machine = new Editor.Time_machine(this)
		
		this.on('paste', (function()
		{
			var container = this.caret.container()
			if (container.hasClass('hint'))
			{
				container.removeClass('hint')
				container.text('')
				this.caret.move_to(container)
			}
			else if (container.hasClass('tagged_hint'))
			{
				container.removeClass('tagged_hint')
				var parent = container.parent()
				this.caret.move_to(parent)
				container.remove()
			}
		})
		.bind(this))
	},
	
	get_content: function()
	{
		return $(this.content_selector)
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
		this.content.trigger('content_changed.editor', options || {})		
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
	
	insert: function(what, options)
	{
		options = options || {}
		
		var container = this.caret.container()
		if (container.hasClass('hint'))
		{
			container.removeClass('hint')
			options.replace = true
		}
		else if (container.hasClass('tagged_hint'))
		{
			container.removeClass('tagged_hint')
			options.replace_tag = true
		}
		
		if (typeof(what) === 'string')
		{
			//if (what.contains('<'))
			//	throw 'Insert html with .insert_html() function'
			
			if (this.time_machine.can_snapshot_typing())
				this.time_machine.snapshot()
			
			this.insert_text(what, options)
			this.content_changed()
			
			if (!this.continuous_typing)
				this.continuous_typing = true
		
			return
		}
			
		if (what instanceof jQuery)
		{
			this.time_machine.snapshot()
			
			var container = this.caret.container()
			var container_tag = container[0].tagName.toLowerCase()
			
			this.mark(what)
			
			if (options.replace_tag)
			{
				var native_container = this.caret.native_container()
				var parent_container = native_container.parentNode
				Dom_tools.replace(parent_container, what[0])
				return this.unmark()
			}
			else if (options.replace)
			{
				var native_container = this.caret.native_container()
				Dom_tools.replace(native_container, what[0])
				return this.unmark()
			}
			
			var html
			if (options.break_container && container[0] !== this.content[0])
				html = '</' + container_tag + '>' + what.outer_html() + '<' + container_tag + '>'
			else
				html = what.outer_html()
				
 			this.insert_html(html)
			this.checkpoint()
			return this.unmark()
		}
		
		throw 'Unexpected argument type'
	},
	
	insert_text: function(inserted_text, options)
	{
		if (options.replace_tag)
		{
			var container = this.caret.native_container()
			var parent_container = container.parentNode
			var super_parent_container = parent_container.parentNode
			Dom_tools.replace(parent_container, inserted_text)
			return this.caret.move_to(super_parent_container, inserted_text.length)
		}
			
		var caret = this.caret.get()
		var caret_offset = this.caret.offset(caret)
		if (options.replace)
			caret_offset = 0
		
		var container = this.caret.native_container()
		
		if (!Dom_tools.is_text_node(container))
		{
			var offset = this.caret.offset()
			
			if ($.browser.webkit)
				offset--
				
			if (container.childNodes.length === 0 || offset < 0)
			{
				text_container = Dom_tools.text(container, inserted_text)
				return this.caret.create(text_container, inserted_text.length)
			}
			
			var text_container = Dom_tools.find_text_node(container.childNodes[offset], this.content)
		
			if (!text_container)
			{
				text_container = Dom_tools.text(container, inserted_text)
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
		var container = this.caret.native_textual_container()
		var text = { before: '', after: '' }
		
		if (container)
			text = this.caret.text_before_and_after()
		else
			container = this.caret.native_container()
			
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
		
		var before_and_after
		if (parent)
			before_and_after = Dom_tools.html_before_and_after(container)
		else
			before_and_after = { before: '', after: '' }
		
		html = before_and_after.before +
			text.before +
			html +
			text.after + 
			before_and_after.after
			
		if (!node_chain.is_empty())
			Dom_tools.inject_html(html, node_chain)
		else
			container.innerHTML = html
	
		if (how_much_parent_tags_to_close > 0)
			this.refresh_content()
	},
	
	is_empty: function()
	{
		console.log('1' + this.content.text().trim() + '2')
		return this.content.text().trim().length === 0
	},
	
	range: function()
	{
		if (window.getSelection().rangeCount === 0)
			return
			
		return window.getSelection().getRangeAt(0)
	},
	
	create_range: function()
	{
		return document.createRange()
	},
	
	collapse: function(range)
	{
		range.collapse(true)
	},
	
	apply_range: function(range)
	{
		var selection = window.getSelection()
		selection.removeAllRanges()
		selection.addRange(range)
	},
	
	paste: function(what)
	{
		this.insert(what)
	},
	
	deselect: function()
	{
		Editor.deselect()
	}
})

Editor.deselect = function()
{
	window.getSelection().removeAllRanges()
}