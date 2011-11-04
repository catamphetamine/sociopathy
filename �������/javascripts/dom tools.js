var Dom_tools =
{
	is_first_element: function(child, parent)
	{
		if (child instanceof jQuery)
			child = child[0]
			
		if (parent instanceof jQuery)
			parent = parent[0]
	
		if (child === parent)
			return true
	
		do
		{
			var semichild = parent.firstChild

			if (child === semichild)
				return true
				
			parent = semichild
		}
		while (semichild)
		
		return false
	},
	
	is_text_node: function(node)
	{
		return node.nodeType == 3
	},
	
	remove: function(node)
	{
		node.parentNode.removeChild(node)
	},
	
	down_to_text_node: function(node)
	{
		if (this.is_text_node(node))
			return node
		
		if (!node.firstChild)
			throw 'No text node found'
			
		return this.down_to_text_node(node.firstChild)
	},
	
	is_last_element: function(child, parent)
	{
		if (child instanceof jQuery)
			child = child[0]
			
		if (parent instanceof jQuery)
			parent = parent[0]
	
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
	}
}