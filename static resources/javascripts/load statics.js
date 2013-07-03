(function()
{
	window.Optimization = {}
	window.Optimization.Plugins = {}
	
	ajax
	({
		url: add_version('/compressed/everything.html'),
		dataType: 'html',
		success: function(everything)
		{
			var find = function(selector)
			{
				return everything.querySelectorAll(selector)
			}
			
			window.Optimization.Scripts = {}
			window.Optimization.Plugins.Scripts = {}
			
			var body = document.querySelectorAll('body')[0]
			var head = document.querySelectorAll('head')[0]
			
			var scripts = find('html > head > script')
			
			var i = 0
			while (i < scripts.length)
			{
				var script = scripts[i]
				
				var id = script.getAttribute('for')
				//var content = script.firstChild.nodeValue
				
				console.log('got javascript for ' + id)
				//console.log('content: ' + content)
				
				if (script.getAttribute('type') === 'plugin')
					window.Optimization.Plugins.Scripts[id] = script.innerHTML
				else
					window.Optimization.Scripts[id] = script.innerHTML
				
				//$('head').append($('<script/>').html(content))
				
				i++
			}
			
			window.Optimization.Styles = {}
			window.Optimization.Plugins.Styles = {}
			
			var styles = find('html > head > style')
			
			var i = 0
			while (i < styles.length)
			{
				var style = styles[i]
				
				var id = style.getAttribute('for')
				var content = style.innerHTML
				
				console.log('got style for ' + id)
				//console.log('content: ' + content)
				
				/*
				style = document.createElement('style')
				style.innerHTML = content
				head.appendChild(style)
				*/
				
				if (style.getAttribute('type') === 'plugin')
					window.Optimization.Plugins.Styles[id] = content
				else
					window.Optimization.Styles[id] = content
				
				i++
			}
			
			function xml_to_text(element)
			{
				var dummy_container = document.createElement("div")
				dummy_container.appendChild(element)
				return dummy_container.innerHTML
			}
			
			function utf8_to_base64(text)
			{
				return window.btoa(unescape(encodeURIComponent(text)))
			}
			
			function base64_to_utf8(cipher)
			{
				return decodeURIComponent(escape(window.atob(cipher)))
			}
			
			//
	
			window.Optimization.Templates = {}
			window.Optimization.Plugins.Templates = {}
			
			var templates = find('html > body > div.template')
			
			var i = 0
			while (i < templates.length)
			{
				var template = templates[i]
				
				var id = template.getAttribute('for')
				
				// decode from base64
				var html = base64_to_utf8(template.innerHTML)
				
				console.log('storing html template for ' + id)
				//console.log('content: ' + html)
				
				if (template.getAttribute('type') === 'plugin')
					window.Optimization.Plugins.Templates[id] = html
				else
					window.Optimization.Templates[id] = html
				
				i++
			}
			
			//
			
			window.Optimization.Page_templates = {}
			window.Optimization.Plugins.Page_templates = {}
			
			var templates = find('html > body > div.page_template')
			
			var i = 0
			while (i < templates.length)
			{
				var template = templates[i]
				
				var id = template.getAttribute('for')
				
				// decode from base64
				var html = base64_to_utf8(template.innerHTML)
				
				console.log('storing page template for ' + id)
				//console.log('content: ' + html)
				
				if (template.getAttribute('type') === 'plugin')
					window.Optimization.Plugins.Page_templates[id] = html
				else
					window.Optimization.Page_templates[id] = html
				
				i++
			}
			
			//
			
			window.Optimization.Кусочки = {}
			
			var pieces = find('html > body > div.piece')
			
			var i = 0
			while (i < pieces.length)
			{
				var piece = pieces[i]
				
				var id = piece.getAttribute('for')
				
				/*
				var xml = xml_to_text(piece)
				
				var html = xml.substring(xml.indexOf('>') + 1, xml.lastIndexOf('</div>'))
				*/
				
				// decode from base64
				var html = base64_to_utf8(piece.innerHTML)
				
				console.log('inserting html piece ' + id)
				//console.log('content: ' + html)
				
				window.Optimization.Кусочки[id] = html
				
				/*
				var dummy = document.createElement('div')
				dummy.innerHTML = html
				var piece_elements = dummy.childNodes
				
				var j = 0
				while (j < piece_elements.length)
				{
					body.appendChild(piece_elements[j])
					j++
				}
				*/
				
				i++
			}
			
			// finished
			window.run_scripts()
		},
		error: function()
		{
			console.error('Ошибка при получении сжатой версии сайта')
			webpage_loading_error()
		}
	})
})()
