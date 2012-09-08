var Dom_tools =
{
	is_first_element: function(child, parent)
	{
		child = this.normalize(child)
		parent = this.normalize(parent)
		
		if (child === parent)
			return true
			
		if (child !== child.parentNode.firstChild)
			return false
			
		return this.is_first_element(child.parentNode, parent)
	},
	
	is_text_node: function(node)
	{
		node = this.normalize(node)
		return node.nodeType == 3
	},
	
	remove: function(node)
	{
		node.parentNode.removeChild(node)
	},
	
	find_text_node: function(node, till)
	{
		node = this.normalize(node)
		
		var text_node = Dom_tools.down_to_text_node(node)
			
		if (text_node)
			return text_node
			
		text_node = Dom_tools.find_next_text_node(node, till)
			
		if (text_node)
			return text_node
			
		//throw 'Text node not found'
	},
	
	down_to_text_node: function(node)
	{
		node = this.normalize(node)
		
		if (this.is_text_node(node))
			return node
		
		var i = 0
		while (i < node.childNodes.length)
		{
			var text_node = this.down_to_text_node(node.childNodes[i])
			if (text_node)
				return text_node
			i++
		}
		
		return null
		//throw 'No text node found'
	},
	
	/**
	 * этот алгоритм можно улучшить, помечая уже пройденные узлы,
	 * чтобы не искать вглубь по нескольку раз (down_to_text_node)
	 */
	find_next_text_node: function(node, highest_parent)
	{
		node = this.normalize(node)
		highest_parent = this.normalize(highest_parent)
		
		if (this.is_text_node(node))
			return node
		
		if (node === highest_parent)
			return null
		
		var next = this.next(node)
		
		if (!next)
			return this.find_next_text_node(node.parentNode, highest_parent)
		
		var child_text_node = this.down_to_text_node(next)
		if (child_text_node)
			return child_text_node
			
		return this.find_next_text_node(next, highest_parent)
	},
	
	append_text_next_to: function(node, text)
	{
		if (typeof node === 'string')
		{
			var the_node = text
			text = node
			node = the_node
		}
		
		var text_node = document.createTextNode(text)
		this.insert_x_after_y(text_node, node)
		return text_node
	},
	
	child_text_node: function(element)
	{
		var text_node
		var tools = this
		
		element = this.normalize(element)
		
		Array.for_each(element.childNodes, function()
		{
			if (tools.is_text_node(this))
				text_node = this
		})
		
		return text_node
	},
	
	append_text: function(text, to)
	{
		var last_node = this.get_last_child(to)
		if (last_node && this.is_text_node(last_node))
			return last_node.nodeValue += text
		
		var node = document.createTextNode(text)
		to.appendChild(node)
		
		return node
		
		/*
		var text_node = Dom_tools.child_text_node(to)
		
		if (!text_node)
			return to.appendChild(document.createTextNode(text))
		
		text_node.nodeValue += text
		*/
	},
	
	to_text: function(node)
	{
		if (Dom_tools.is_text_node(node))
			return node.nodeValue
		
		return $(node).outer_html()
	},
	
	insert_x_after_y: function (x, y)
	{
		x = this.normalize(x)
		y = this.normalize(y)
		
		if (y.nextSibling)
			y.parentNode.insertBefore(x, y.nextSibling)
		else
			y.parentNode.appendChild(x)
	},

	is_last_element: function(child, parent)
	{
		child = this.normalize(child)
		parent = this.normalize(parent)
	
		if (child === parent)
			return true
			
		do
		{
			var semichild
			
			var contents = parent.childNodes
			if (contents.length > 0)
				semichild = contents[contents.length - 1]
			
			if (child === semichild)
				return true
				
			if (parent === semichild)
				return false
				
			parent = semichild
		}
		while (semichild)
		
		return false
	},
	
	get_last_child: function(element)
	{
		if (element.childNodes.length === 0)
			return
			
		return element.childNodes[element.childNodes.length - 1]
	},
	
	get_last_descendant: function(element)
	{
		if (element.childNodes.length === 0)
			return
			
		do
		{
			var contents = element.childNodes
			
			if (contents.length === 0)
				return element
				
			element = contents[contents.length - 1]
		}
		while (true)
	},
	
	outer_html: function(node)
	{
		node = this.normalize(node)
		
		// if IE, Chrome take the internal method otherwise build one
		return node.outerHTML || (
			function(node)
			{
				var div = document.createElement('div')
				div.appendChild(node.cloneNode(true))
				var html = div.innerHTML
				div = null
				return html
			})
			(node)
	},
	
	clone: function(node)
	{
		return node.cloneNode(true)
	},
	
	remove_children: function(node)
	{
		if (node.hasChildNodes())
			while (node.childNodes.length >= 1)
				node.removeChild(node.firstChild)
	},
	
	boundary_html: function(node)
	{
		var div = document.createElement('div')
		var clone = this.clone(node)
		this.remove_children(clone)
		
		div.appendChild(clone)
		var html = div.innerHTML
		div = null
		
		var closing_tag_index = html.indexOf('</')	
		var htmls =
		{
			opening: html.substring(0, closing_tag_index),
			closing: html.substring(closing_tag_index)
		}
		
		return htmls
	},
	
	inject_html: function(injected_html, node_chain)
	{
		node_chain[0].innerHTML = Dom_tools.get_inner_html_with_injection(injected_html, node_chain)
	},
	
	html_before_and_after: function(node)
	{
		var parent = node.parentNode
		var child = node
	
		var html = { before: '', after: '' }
		
		var found = false
		
		var index = 0
		while (index < parent.childNodes.length)
		{
			var child_node = parent.childNodes[index]
			
			if (child_node === child)
			{
				found = true
				index++
				continue
			}
			
			if (!found)
				html.before += Dom_tools.outer_html(child_node)
			else
				html.after += Dom_tools.outer_html(child_node)
			
			index++
		}
		
		return html
	},
	
	get_inner_html_with_injection: function(injected_html, node_chain, chain_index)
	{
		if (typeof(chain_index) === 'undefined')
			chain_index = 0
			
		if (chain_index + 1 === node_chain.length)
			return injected_html
	
		var parent = node_chain[chain_index]
		var child = node_chain[chain_index + 1]
	
		var html = this.html_before_and_after(child)
	
		var boundary_html = Dom_tools.boundary_html(child)
			
		return html.before +
			boundary_html.opening + 
			Dom_tools.get_inner_html_with_injection(injected_html, node_chain, chain_index + 1) +
			boundary_html.closing +
			html.after
	},
	
	get_node_backtrack: function(node, till)
	{
		node = this.normalize(node)
		till = this.normalize(till)
	
		if (node === till)
			return []
	
		if (node.parentNode === till)
			return [this.get_child_index(node)]
	
		var backtrack = this.get_node_backtrack(node.parentNode, till)
		backtrack.push(this.get_child_index(node))
	
		return backtrack
	},
	
	get_node_by_backtrack: function(backtrack, start)
	{
		if (backtrack.is_empty())
			return start
			
		return this.get_node_by_backtrack(backtrack, start.childNodes[backtrack.shift()])
	},
	
	get_child_index: function(child)
	{
		var parent = child.parentNode
		
		var index = 0
		while (index < parent.childNodes.length)
		{
			if (parent.childNodes[index] === child)
				return index
				
			index++
		}
	},
	
	next: function(node)
	{
		return node.nextSibling
	},
	
	normalize: function(element)
	{
		if (element instanceof jQuery)
			element = element[0]
			
		return element
	},
	
	/**
	* Getting the closest parent with the given tag name.
	*/
	find_parent_by_tag: function(child, tag)
	{
		var parent = child.parentNode
		if (!parent)
			return null
		
		if (parent.tagName)
			if (parent.tagName.toLowerCase() === tag)
				return parent

		return this.find_parent_by_tag(parent, tag)
	},
	
	replace: function(what, with_what)
	{
		if (typeof with_what === 'string')
			with_what = document.createTextNode(with_what)
		var where = what.parentNode
		return where.replaceChild(with_what, what)
	},
	
	text: function(element, text)
	{
		text = document.createTextNode(text)
		element.appendChild(text)
		return text
	},
	
	uppest_before: function(node, ceiling)
	{
		if (node === ceiling)
			throw 'The node is ceiling'
	
		while (node.parentNode !== ceiling)
		{
			node = node.parentNode
		}
		return node
	}
}