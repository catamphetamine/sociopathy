var Dom_tools =
{
	is_first_element: function(child, parent)
	{
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
	
	is_last_element: function(child, parent)
	{
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
	}
}