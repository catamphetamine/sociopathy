Wiki_processor = new (new Class
({
	find_syntax_for: function(element)
	{
		var found
		
		Object.for_each(this.Syntax, function(key, syntax)
		{
			if (element.is(syntax.selector))
			{
				found = syntax
				found.tag = key
			}
		})
		
		return found
	},
	
	get_syntax_by_translation: function(translation)
	{
		var found
		
		Object.for_each(this.Syntax, function(key, syntax)
		{
			if (this.translation)
			{
				if (typeof this.translation === 'string')
				{
					if (this.translation === translation)
						found = this
				}
				else
				{
					if (Object.key(this.translation) === translation)
						found = this
				}
			}
			else if (key === translation)
				found = this
		})
				
		return found
	},
	
	translate: function(xml)
	{
		Object.for_each(this.Syntax, function(tag, syntax)
		{
			var translation = syntax.translation
				
			if (!syntax.translation)
				return
			
			if (typeof translation === 'string')
			{
				xml = xml.replace_all('<' + tag + '>', '<' + translation + '>')
				xml = xml.replace_all('<' + tag + ' ', '<' + translation + ' ')
				xml = xml.replace_all('</' + tag + '>', '</' + translation + '>')
			}
			else
			{
				var tag_translation = Object.key(translation)
				translation = translation[Object.key(translation)]
			
				Object.for_each(translation, function(attribute, translation)
				{
					var regexp = RegExp.escape('<' + tag) + ' ([^>]*)' + RegExp.escape(attribute + '=')
					var replace_with = '<' + tag + ' $1' + translation + '='

					xml = xml.replace(new RegExp(regexp, 'g'), replace_with)
				})
				
				xml = xml.replace_all('<' + tag + '>', '<' + tag_translation + '>')
				xml = xml.replace_all('<' + tag + ' ', '<' + tag_translation + ' ')
				xml = xml.replace_all('</' + tag + '>', '</' + tag_translation + '>')
			}
		})
		
		return xml
	},
	
	validate: function(xml)
	{
		xml = this.translate(xml.trim())
		
		var result = Dom.validate_xml(xml)
		
		if (!result)
			return
		
		if (!result.cause)
		{
			var document = result
			
			var inner_paragraph = document.querySelector('paragraph paragraph')
			if (inner_paragraph)
				throw { ошибка: 'Нарушено форматирование текста: абзац внутри абзаца', explanation: Dom.outer_html(inner_paragraph) , verbose: true }
			
			return
		}
		
		switch (result.cause)
		{
			case 'text node in root':
				console.log(result.explanation)
				throw { ошибка: 'Нарушено форматирование текста: текст вне абзаца', explanation: result.explanation, verbose: true }
			
			default:
				console.log(result.cause)
			//	throw { ошибка: result.cause, verbose: true }
		}
		
		//throw { ошибка: 'Не "валидный" код xml', verbose: true }
		throw 'Не "валидный" код xml' // + xml
	},
	
	simplify: function(xml, options)
	{
		options = options || {}
		
		if (!xml)
			return ''
		
		if (typeof(xml) === 'string')
		{
			xml = this.translate(xml)
			
			//console.log('Simplifying: ' + xml)
			
			var wiki = document.createElement('wiki')
			wiki.innerHTML = xml
			
			xml = wiki
		}
		
		var processor = this
		
		var text = ''
		
		Array.for_each(xml.childNodes, function()
		{
			text += processor.simplify_node(this, options).trim()
		})
		
		return text
	},
			
	simplify_node: function(node, options)
	{
		var processor = this
		
		//console.log('simplify_node')
		//console.log(node)
		
		var syntax
		if (!Dom.is_text_node(node))
			syntax = processor.get_syntax_by_translation(node.tagName.toLowerCase())
		
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
			return Dom.text(node)
	
		//console.log('syntax found')
		
		var is_root_node = node.parentNode.parentNode === null
		
		//console.log('is root node?')
		//console.log(is_root_node)
		
		var simplified
		if (syntax.simplified)
		{
			simplified = syntax.simplify(node, { is_last: node.parentNode.lastChild === node })
		}
		else if (is_root_node)
		{
			simplified = ''
		}
		else
			simplified = Dom.text(node)
		
		if (is_root_node)
		{
			if (node.parentNode.firstChild !== node)
				simplified = '\n\n' + simplified
		}
		
		//console.log('simplified')
		//console.log(simplified)
		
		if (syntax.break_simplification)
			return simplified
		
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			//console.log(this)
			
			simplified += processor.simplify_node(this, options)
		})
		
		//console.log('finished processing children')
		
		return simplified
	},
	
	decorate: function(xml, options)
	{
		options = options || {}
		
		if (!xml)
			return ''
		
		if (typeof(xml) === 'string')
		{
			xml = this.translate(xml)
			
			//console.log(xml)
			
			var wiki = document.createElement('wiki')
			wiki.innerHTML = xml
			
			xml = wiki
		}
		
		var processor = this
		var output = document.createElement('xml')
		
		Array.for_each(xml.childNodes, function()
		{
			processor.decorate_node(this, output, options)
		})
		
		return output.innerHTML
	},
			
	decorate_node: function(node, target, options)
	{
		//if (this.timer < new Date().getTime())
		//	return
		
		var processor = this
		
		//console.log('decorate_node')
		//console.log(node)
		
		//console.log('target')
		//console.log(target)
		
		var syntax
		if (!Dom.is_text_node(node))
			syntax = processor.get_syntax_by_translation(node.tagName.toLowerCase())
			
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
		{
			if (target.tagName.toLowerCase() === 'xml')
				return
			
			return Dom.append_text(Dom.text(node), target)
		}
	
		//console.log('syntax found')
		
		var html_node
		if (syntax.html_tag)
		{
			html_node = document.createElement(syntax.html_tag)
			if (syntax.decorate)
				syntax.decorate(node, html_node)
		}
		else
			html_node = syntax.decorate(node)
		
		if (options.process_node)
			options.process_node(html_node, node)
		
		target.appendChild(html_node)
		
		if (syntax.break_decoration)
			return
		
		//console.log(html_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			processor.decorate_node(this, html_node, options)
		})
		
		//console.log('finished processing children')
	},
	
	parse_and_validate: function(xml, options, callback)
	{
		if (typeof options === 'function')
		{
			callback = options
			options = null
		}
		
		options = options || {}
		
		xml = xml.replace_all('&nbsp;', ' ')
		
		function finish(wiki)
		{
			try
			{
				this.validate(wiki)
				
				if (callback)
					callback(wiki)
				else
					return wiki
			}
			catch (ошибка)
			{
				show_error(ошибка)
				//console.log(ошибка)
				//throw get_error_message(ошибка) //{ error: 'Invalid xml: ' + wiki }
				throw dont_show_error(ошибка)
			}
		}
		
		finish = finish.bind(this)
		
		if (callback)
			this.parse(xml, options, finish)
		else
			return finish(this.parse(xml, options))
	},
	
	parse: function(xml, options, callback)
	{
		if (typeof options === 'function')
		{
			callback = options
			options = null
		}
		
		options = options || {}
		
		if (typeof(xml) === 'string')
		{
			//console.log(xml)
			
			var xml_node = document.createElement('xml')
			xml_node.innerHTML = xml
			
			xml = xml_node
		}
		
		var processor = this
		var output = document.createElement('wiki')
		
		function finish()
		{
			Array.for_each(output.querySelectorAll('paragraph'), function()
			{
				var paragraph = this
				
				Dom.trim_element(paragraph)
				
				if (Dom.is_empty(paragraph))
					Dom.remove(paragraph)
			})
			
			var xml = output.html()
				
	//		xml = xml.replace_all('<br>', '\n')
	//		xml = xml.replace_all('<br/>', '\n')
	
			//xml = xml.replace_all('&lt;br&gt;', '')
			//xml = xml.replace_all('&lt;br/&gt;', '')
		
			Object.for_each(this.Syntax, function(tag, syntax)
			{
				var translation = syntax.translation
				
				if (!translation)
					return
				
				if (typeof translation === 'string')
				{
					xml = xml.replace_all('<' + translation + '>', '<' + tag + '>')
					xml = xml.replace_all('<' + translation + ' ', '<' + tag + ' ')
					xml = xml.replace_all('</' + translation + '>', '</' + tag + '>')
				}
				else
				{
					var tag_translation = Object.key(translation)
					translation = translation[Object.key(translation)]
				
					xml = xml.replace_all('<' + tag_translation + '>', '<' + tag + '>')
					xml = xml.replace_all('<' + tag_translation + ' ', '<' + tag + ' ')
					xml = xml.replace_all('</' + tag_translation + '>', '</' + tag + '>')
					
					Object.for_each(translation, function(attribute, translation)
					{
						var regexp = RegExp.escape('<' + tag) + ' ([^>]*)' + RegExp.escape(translation + '=')
						var replace_with = '<' + tag + ' $1' + attribute + '='
						
						xml = xml.replace(new RegExp(regexp, 'g'), replace_with)
					})
				}
			})
			
			return xml.trim()
		}
		
		function iterate(callback)
		{
			Array.for_each(xml.childNodes, function()
			{
				processor.parse_node(this, output, options, callback)
			})
		}
		
		if (callback)
		{
			var countdown = Countdown(xml.childNodes.length, function()
			{
				return callback(finish())
			})
			
			iterate(countdown)
		}
		else
		{
			iterate()
			
			return finish()
		}
	},
			
	parse_node: function(node, target, options, callback)
	{
		function finished()
		{
			if (callback)
				return callback()
		}
		
		//if (this.timer < new Date().getTime())
		//	return
		
		var processor = this
		
		//console.log('parse_node')
		//console.log(node)
		
		//console.log('target')
		//console.log(target)
		
		var syntax
		
		if (!Dom.is_text_node(node))
		{
			if (Dom_tools.is(node, 'br'))
				return finished()
				
			syntax = processor.find_syntax_for(node)
		}
		
		//console.log('node')
		//console.log(node)
			
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
		{
			if (target.tagName.toLowerCase() === 'wiki')
				return finished()
			
			function is(element)
			{
				var translation = Wiki_processor.Syntax[element].translation
				
				if (typeof translation === 'object')
					translation = Object.key(translation)
			
				return target.tagName && target.tagName.toLowerCase() === translation
			}
			
			return this.append_text(Dom.text(node), target, { parse: is('абзац') || is('автор') || is('текст') }, callback)
		}
	
		if (syntax.is_dummy)
			if (syntax.is_dummy(node))
				return finished()
		
		var tag
		if (!syntax.translation)
			tag = syntax.tag
		else if (typeof syntax.translation === 'string')
			tag = syntax.translation
		else
			tag = Object.key(syntax.translation)
		
		var wiki_element = document.createElement(tag)
			
		if (syntax.parse)
			syntax.parse(node, wiki_element)
		
		if (options.process_element)
			options.process_element(wiki_element, node)
		
		if (syntax.content_required)
			if (Dom.is_empty(node))
				return finished()
		
		target.appendChild(wiki_element)
		
		if (syntax.break_parsing)
			return finished()
		
		//console.log(wiki_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		function finish()
		{
			Dom.trim_element(wiki_element)
			
			if (syntax.finish)
				syntax.finish(wiki_element)
		}
		
		function iterate(callback)
		{
			var wiki_node = wiki_element
			
			Array.for_each(node.childNodes, function()
			{
				processor.parse_node(this, wiki_node, node, function(result)
				{
					if (result)
						wiki_node = result
					
					if (callback)
						callback()
				})
			})
		}
		
		if (callback)
		{
			var countdown = Countdown(node.childNodes.length, function()
			{
				finish()
				callback()
			})
			
			iterate(countdown)
		}
		else
		{
			iterate()
			finish()
		}
	},
	
	append_text: function(text, target, options, callback)
	{
		function to()
		{
			return target
		}
		
		//text = text.trim()
		
		// если не парсить текст "умным" образом, то просто текст будет
		if (!callback)
			return Dom.append_text(text, to())
			
		function just_append_text()
		{
			Dom.append_text(text, to())
			callback(to())
		}
	
		/*
		function can_contain_hyperlinks()
		{
			return text.contains('http://') || text.contains('https://') || text.contains('ftp://')
		}
		
		if (!options.parse || !can_contain_hyperlinks())
			return just_append_text()
		*/
		
		if (!options.parse)
			return just_append_text()
	
		function append(what, separator)
		{
			if (typeof what === 'string')
				Dom.append_text(what, to())
			else
				to().appendChild(what)
			
			if (typeof separator !== 'undefined')
				Dom.append_text(separator, to())
		}
		
		var pure_text_blocks = []
		
		function append_pure_text()
		{
			if (pure_text_blocks.is_empty())
				return
			
			var text = ''
			pure_text_blocks.for_each(function()
			{
				text += this.fragment
				
				if (typeof this.separator !== 'undefined')
					text += this.separator
			})
			
			pure_text_blocks = []
			
			var node = append(text)
			
			return node
		}
		
		/*
		// при любом тримминге инлайновые ссылки получаются в отдельных text'ах и пробелы по их бокам съедаются
		text = text
			.split('\n')
			.map(function(line) { return line.trim() })
			.join('\n')
			
		триммить можно только абзацы
		*/
		
		var fragments_and_separators = []
		
		function walk_fragments(fragments, action)
		{
			var i = 0
			while (i < fragments.length)
			{
				var fragment = fragments[i] || ''
				var separator = fragments[i + 1] || ''
			
				if (fragment || separator)
					action(fragment, separator)
			
				fragments.remove_at(i + 1)
				i++
			}
		}
		
		var fragments = text.split(/(\s)/)
		
		walk_fragments(fragments, function(fragment, separator)
		{
			if (Smart_parser.is_a_link(fragment))
				return fragments_and_separators.push({ fragment: fragment, separator: separator })
			
			var subfragments = (fragment + separator).split(/(\s|(?:[\?\!\),;\.\:…]+(?:\s|$)))/)
			
			walk_fragments(subfragments, function(fragment, separator)
			{
				fragments_and_separators.push({ fragment: fragment, separator: separator })
			})
		})
		
		// whitespace, or any of "?!),;…", or ":" and a whitespace, or "." and a whitespace, or "." in the end
		//var fragments = text.split(/([\?\!\),;…]+|(?:\:\s)|(?:\.\s)|(?:\.$))/)
		
		//console.log(fragments)
		
		//console.log(fragments_and_separators.clone())
		
		Sequential_countdown(fragments_and_separators, function(next)
		{
			//console.log(this.fragment)
			
			if (this.fragment.is_empty())
			{
				pure_text_blocks.add(this)
				return next()
			}
			
			Smart_parser.is_a_link(this.fragment, function(is_a_link)
			{
				if (!is_a_link)
				{
					pure_text_blocks.add(this)
					return next()
				}
				
				if (is_a_link !== true)
					this.fragment = is_a_link
				
				append_pure_text()
				
				Smart_parser.ссылка_на_картинку(this.fragment, (function(result)
				{
					if (!result.error)
					{
						var tag = Object.key(Wiki_processor.Syntax.картинка.translation)
						
						var width = Wiki_processor.Syntax.картинка.translation[tag].ширина
						var height = Wiki_processor.Syntax.картинка.translation[tag].высота
						
						var picture = document.createElement(tag)
						
						picture.setAttribute(width, result.width)
						picture.setAttribute(height, result.height)
						
						Dom.text(picture, decodeURI(this.fragment))
							
						append(picture, this.separator)
						return next()
					}
					
					if (Smart_parser.ссылка_на_видео_на_youtube(this.fragment)
					    && Dom.is(to(), 'paragraph'))
					{
						var tag = 'youtube'
						
						var video = document.createElement(tag)
						video.innerHTML = Youtube.Video.id(this.fragment)
							
						Dom.insert_x_after_y(video, to())
						
						target = document.createElement('paragraph')
						to().parentNode.appendChild(target)
						
						return next()
					}
					
					if (Smart_parser.ссылка_на_видео_на_vimeo(this.fragment)
					     && Dom.is(to(), 'paragraph'))
					{
						var tag = 'vimeo'
						
						var video = document.createElement(tag)
						video.innerHTML = Vimeo.Video.id(this.fragment)
							
						Dom.insert_x_after_y(video, to())
						
						target = document.createElement('paragraph')
						to().parentNode.appendChild(target)
						
						return next()
					}
				
					var link = Smart_parser.просто_ссылка(this.fragment)
						
					append(link, this.separator)
					
					return next()
				})
				.bind(this))
			}
			.bind(this))
		},
		function()
		{
			append_pure_text()
			callback(to())
		})
	},
	
	test: function()
	{
		var wiki = "<абзац>Материальная точка</абзац>" +
	
			"<абзац>Используется в физике <формула ширина=\"104\" высота=\"28\">(physics)</формула> в качестве <код>упрощённой модели</код> относительно малого объекта.</абзац>" +

			"<выдержка><текст>Война - это путь обмана. </текст><автор>Cунь Цзы</автор></выдержка>" +
			
			"<абзац>Вставим-ка: <картинка ширина=\"128\" высота=\"128\">http://cdn1.iconfinder.com/data/icons/49handdrawing/128x128/picture.png</картинка>, вот так.</абзац>" +
			
			"<абзац><youtube>quYfLkJMN1g</youtube></абзац>" +
			
			"<абзац><vimeo>47387431</vimeo></абзац>" +
			
			"<unknown_tag><vimeo>47387431</vimeo></unknown_tag>" +
			
			"<абзац>Однако <жирный>не всегда</жирный> можно <курсив>пользоваться</курсив> материальными<сверху>1</сверху> точками<снизу>2</снизу> для решения задач. Например, при расчёте распределения энергии молекул в <ссылка на=\"/читальня/химия/инертный газ\">инертном газе</ссылка> можно представить молекулы материальными точками (шариками). Однако для других веществ начинает иметь значение строение молекулы, так как колебание и вращение самой молекулы начинают запасать в себе значительную энергию.</абзац>" +
			
			"<многострочный_код>a = 1\nb = 2\nor a, b = 3</многострочный_код>" + 
			
			"<заголовок_2>Ссылки</заголовок_2>" +
	
			"<список>" +
			"<пункт><ссылка на=\"http://ru.wikipedia.org/wiki/Материальная_точка\">WikiPedia</ссылка></пункт>" +
			"<пункт><ссылка на=\"http://phys.msu.ru/\">ФизФак МГУ</ссылка></пункт>" +
			"</список>"
				
		//console.log(wiki)
				
		var html = this.decorate(wiki)
		
		//console.log('*** html ***')
		//console.log(html)
		
		body.appendChild(html)
		
		//console.log('*** parsing html ***')
		
		this.parse(html, function(same_wiki)
		{
			same_wiki = same_wiki.replace_all('&lt;', '<').replace_all('&gt;', '>')
			
			//console.log('*** wiki ***')
			//console.log(same_wiki)
			
			var pre = document.createElement('pre')
			body.appendChild(Dom.text(pre, same_wiki))
			
			if (same_wiki != wiki)
				throw 'Wiki processor malfunction'
		})
	}
}))

//Wiki_processor.timer = new Date().getTime() + 5000

Wiki_processor.Syntax =
{
	default:
	{
		decorate: function(from, to)
		{
			return to
		},
		
		parse: function(from, to)
		{
			return to
		}
	},
	абзац:
	{
		translation:
		{
			paragraph:
			{
				выравнивание: 'alignment'
			}
		},
		selector: 'p',
		html_tag: 'p',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		},
		
		decorate: function(from, to)
		{
			var alignment
			switch (from.getAttribute('alignment'))
			{
				case 'влево':
					alignment = 'left'
					break
				
				case 'по середине':
					alignment = 'center'
					break
				
				case 'вправо':
					alignment = 'right'
					break
				
				case 'по ширине':
					alignment = 'justify'
					break
			}
			
			if (alignment)
				to.style.textAlign = alignment
			
			return to
		},
		
		parse: function(from, to)
		{
			var выравнивание
			switch (from.style.textAlign)
			{
				case 'left':
					выравнивание = 'влево'
					break
				
				case 'center':
					выравнивание = 'по середине'
					break
				
				case 'right':
					выравнивание = 'вправо'
					break
				
				case 'justify':
					выравнивание = 'по ширине'
					break
			}
			
			if (выравнивание)
				to.setAttribute('alignment', выравнивание)
			
			return to
		}
	},
	выдержка:
	{
		translation: 'citation',
		selector: 'div.citation',
		html_tag: 'div',
		
		is_dummy: function(element)
		{
			var text = element.querySelector('> .text')
				
			if (text.classList.contains('hint'))
				return true
			
			if (Dom.is_empty(text))
				return true
		},
	
		decorate: function(from, to)
		{
			return to.classList.add('citation')
		}
	},
	текст:
	{
		translation: 'text',
		selector: '.citation > .text',
		html_tag: 'q',
		
		decorate: function(from, to)
		{
			return to.classList.add('text')
		}
	},
	автор:
	{
		translation: 'author',
		selector: '.citation > .author',
		html_tag: 'div',
	
		//break_parsing: true,
	
		simplify: function(from)
		{
			return ' (' + Dom.text(from) + ')'
		},
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
			
			if (Dom.is_empty(element))
				return true
		},
		
		decorate: function(from, to)
		{
			return to.classList.add('author')
		}
	},
	заголовок_2:
	{
		translation: 'header_2',
		selector: 'h2',
		html_tag: 'h2',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	жирный:
	{
		translation: 'bold',
		selector: 'strong',
		html_tag: 'strong',
		content_required: true
	},
	курсив:
	{
		translation: 'italic',
		selector: 'em',
		html_tag: 'em',
		content_required: true
	},
	список:
	{
		translation: 'list',
		selector: 'ul',
		html_tag: 'ul',
		
		is_dummy: function(element)
		{
			if (element.firstChild.classList.contains('hint'))
				return true
		}
	},
	пункт:
	{
		translation: 'item',
		selector: 'li',
		html_tag: 'li',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
			
			if (element.innerHTML.trim() === '')
				return true
		},
		
		simplify: function(from, info)
		{
			var text = Dom.text(from)
			
			if (!info.is_last)
				text += ', '
				
			return text
		}
	},
	ссылка:
	{
		translation:
		{
			'hyperlink':
			{
				на: 'at'
			}
		},
		selector: 'a[type="hyperlink"]',
		html_tag: 'a',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
			
			if (element.innerHTML.trim() === '')
				return true
		},
		
		decorate: function(from, to)
		{
			var url = from.getAttribute('at')
			
			to.setAttribute('type', 'hyperlink')
			to.setAttribute('href', url)
			
			if (!is_internal_url(url))
				to.setAttribute('target', '_blank')
			
			return to
		},
		
		parse: function(from, to)
		{
			var url = decodeURI(from.getAttribute('href'))
			
			if (is_external_internal_url(url))
				url = is_external_internal_url(url)
				
			to.setAttribute('at', url)
			
			return to
		}
	},
	картинка:
	{
		translation:
		{
			'picture':
			{
				ширина: 'width',
				высота: 'height',
				положение: 'float'
			}
		},
		selector: 'img[type="picture"]',
		html_tag: 'img',
		
		break_simplification: true,
		
		simplify: function(from)
		{
			return '(картинка)'
		},
		
		break_decoration: true,
		
		decorate: function(from, to)
		{
			var float
			switch (from.getAttribute('float'))
			{
				case 'слева':
					float = 'left'
					break
				
				case 'в строке':
					float = 'none'
					break
				
				case 'справа':
					float = 'right'
					break
			}
			
			to.style.float = float
			
			to.setAttribute('src', from.innerHTML)
			to.setAttribute('width', from.getAttribute('width'))
			to.setAttribute('height', from.getAttribute('height'))
			to.setAttribute('type', 'picture')
			
			return to
		},
		
		parse: function(from, to)
		{
			to.setAttribute('width', from.getAttribute('width'))
			to.setAttribute('height', from.getAttribute('height'))
			
			var положение
			switch (from.style.float)
			{
				case 'left':
					положение = 'слева'
					break
				
				case 'none':
					положение = 'в строке'
					break
				
				case 'right':
					положение = 'справа'
					break
			}
			
			to.setAttribute('float', положение)
			
			to.innerHTML = from.getAttribute('src')
			
			return to
		}
	},
	формула:
	{
		translation:
		{
			'formula':
			{
				положение: 'display'
			}
		},
		selector: '.tex[type="formula"]',
		//html_tag: 'div',
		html_tag: 'span',
		
		break_simplification: true,
		
		simplify: function(from)
		{
			return '(формула)'
		},
		
		break_decoration: true,
		break_parsing: true,
		
		decorate: function(from, to)
		{
			to.classList.add('tex')
			
			if (from.getAttribute('display') === 'в строке')
			{
				to.innerHTML = delimit_formula(from.innerHTML, 'inline')
				to.style.display = 'inline'
			}
			else
			{
				to.innerHTML = delimit_formula(from.innerHTML, 'block')
				to.style.display = 'block'
			}
			
			to.setAttribute('type', 'formula')
			to.setAttribute('formula', from.innerHTML)
			
			return to
		},
		
		parse: function(from, to)
		{
			to.innerHTML = from.getAttribute('formula')
			
			if (from.style.display === 'inline')
				to.setAttribute('display', 'в строке')
			else
				to.setAttribute('display', 'вне строки')
			
			return to
		}
	},
	снизу:
	{
		translation: 'subscript',
		selector: 'sub',
		html_tag: 'sub',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	сверху:
	{
		translation: 'superscript',
		selector: 'sup',
		html_tag: 'sup',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	код:
	{
		translation: 'code',
		selector: 'code',
		html_tag: 'code',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	многострочный_код:
	{
		translation: 'multiline_code',
		selector: 'pre',
		html_tag: 'pre',
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	перевод_строки:
	{
		translation: 'break_line',
		selector: 'br',
		html_tag: 'br'
	},
	audio:
	{
		translation:
		{
			'audio':
			{
				название: 'title'
			}
		},
		
		selector: 'div.audio_player',
		html_tag: 'div',
		
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(аудиозапись)'
		},
		
		decorate: function(from, to)
		{
			var url = Dom.text(from)
			to.classList.add('audio_player')
			var link = to.audio_player('link', { url: url, title: from.getAttribute('title') })
			to.appendChild(link)
			to.setAttribute('type', 'audio')
		},
		
		break_parsing: true,
		break_decoration: true,
		
		parse: function(from, to)
		{
			to.setAttribute('title', from.audio_player('title'))
			Dom.text(to, text(from.audio_player('url')))
			return to
		}
	},
	youtube:
	{
		selector: '.video_player[hosting="youtube"]',
		
		decorate: function(from)
		{
			var video_player = document.createElement('div')
			
			video_player.classList.add('video_player')
			
			video_player.setAttribute('hosting', 'youtube')
			
			video_player.innerHTML = Youtube.Video.embed_code(from.innerHTML)
			video_player.firstChild.setAttribute('type', 'video')
			
			return video_player
		},
		
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(видеозапись)'
		},
		
		break_parsing: true,
		break_decoration: true,
		
		parse: function(from, to)
		{
			var url = 'http://www.youtube.com/embed/'
			
			var iframe = from.querySelector('> iframe')
			
			var src = iframe.getAttribute('src')
			if (!src.starts_with(url))
				throw 'Invalid youtube video source: ' + src
			
			var id = src.substring(url.length)
			if (id.has('?'))
				id = id.substring(0, id.indexOf('?'))
			
			to.innerHTML = id
			return to
		}
	},
	vimeo:
	{
		selector: '.video_player[hosting="vimeo"]',
		
		decorate: function(from)
		{
			var video_player = document.createElement('div')
			
			video_player.classList.add('video_player')
			
			video_player.setAttribute('hosting', 'vimeo')
			
			video_player.innerHTML = Vimeo.Video.embed_code(from.innerHTML)
			video_player.firstChild.setAttribute('type', 'video')
			
			return video_player
		},
		
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(видеозапись)'
		},
		
		break_parsing: true,
		break_decoration: true,
	
		parse: function(from, to)
		{
			var url = 'http://player.vimeo.com/video/'
			
			var iframe = from.querySelector('> iframe')
			
			var src = iframe.getAttribute('src')
			if (!src.starts_with(url))
				throw 'Invalid vimeo video source: ' + src
			
			var id = src.substring(url.length)
			if (id.has('?'))
				id = id.substring(0, id.indexOf('?'))
			
			to.innerHTML = id
			return to
		}
	}
}

var Smart_parser = new (new Class
({
	is_a_link: function(text, callback)
	{
		function result(value)
		{
			if (callback)
				return callback(value)
				
			return value
		}
	
		var protocols = ['http', 'https', 'ftp']
		
		// if the text doesn't start with a protocol
		function is_protocol(text)
		{
			return !protocols
				.map(function(protocol) { return protocol + '://' })
				.filter(function(protocol) { return text.starts_with(protocol) })
				.is_empty()
		}
		
		if (is_protocol(text))
			return result(true)
		
		if (Dns.can_be_url(text))
			return result(Uri.assemble(Uri.parse(text)))
		
		/*	
		if (text.has('/') || text.trim_character('.').has('.'))
		{
			return this.проверить_ссылку(text, callback)
		}
		*/
		
		return result(false)
	},
	
	проверить_ссылку: function(url, callback)
	{
		if (!url.starts_with('http'))
			return callback(true)
		
		Ajax.get('/проверить ссылку', { url: url }).ok(function(data)
		{
			callback(data['рабочая ссылка'])
		})
	},
	
	ссылка_на_картинку: function(url, callback)
	{
		var image_file_extensions = ['png', 'jpg', 'gif']
		
		var simplified_url = Uri.assemble(Uri.parse(url.toLowerCase()).no_parameters())
		
		if (image_file_extensions.filter(function(extension) { return simplified_url.ends_with('.' + extension) }).is_empty())
			return callback({ error: true })
		
		get_image_size(url, callback)
	},
	
	ссылка_на_видео_на_youtube: function(url)
	{
		if (Youtube.Video.id(url))
			return true
	},
	
	ссылка_на_видео_на_vimeo: function(url)
	{
		if (Vimeo.Video.id(url))
			return true
	},
	
	просто_ссылка: function(url)
	{
		var tag = Object.key(Wiki_processor.Syntax.ссылка.translation)
		var at = Wiki_processor.Syntax.ссылка.translation[tag].на
		
		var url = decodeURI(url)
		
		if (is_external_internal_url(url))
			url = is_external_internal_url(url)
		
		var link = document.createElement(tag)
		link.setAttribute(at, url)
		
		var uri = Uri.assemble(Uri.parse(url), { omit_common_protocols: true })
		
		uri = uri.cut_in_the_start('www.')
		uri = uri.cut_in_the_end('/')
		
		Dom.text(link, uri)
		
		return link
	}
}))

//var xml = '<paragraph>Материальная точка — объект, не имеющий размеров, но обладающий всеми остальными свойствами (массой, зарядом и т.п.).</paragraph><paragraph>Используется в физике <formula>(physics)</formula> в качестве <code>упрощённой модели</code> относительно малого объекта (относительно малого в рамках задачи). Например, при расчёте пути, пройденного поездом из Петрограда во Владивосток, можно пренебречь его очертаниями и размерами, поскольку они гораздо меньше протяжённости пути.</paragraph><citation><text>Война - это путь обмана. Поэтому, даже если [ты] способен, показывай противнику свою неспособность. Когда должен ввести в бой свои силы, притворись бездеятельным. Когда [цель] близко, показывай, будто она далеко; когда же она действительн далеко, создавай впечатление, что она близко</text><author>Cунь Цзы, «Искусство Войны»</author></citation><paragraph>Вставим-ка сюда картинку: <picture>http://cdn1.iconfinder.com/data/icons/49handdrawing/128x128/picture.png</picture>, вот так.</paragraph><paragraph><youtube>quYfLkJMN1g</youtube></paragraph><paragraph><vimeo>47387431</vimeo></paragraph><paragraph>Однако <bold>не всегда</bold> можно <italic>пользоваться</italic> материальными<superscript>1</superscript> точками<subscript>2</subscript> для решения задач. Например, при расчёте распределения энергии молекул в &lt;a type="hyperlink" href="/%D1%87%D0%B8%D1%82%D0%B0%D0%BB%D1%8C%D0%BD%D1%8F/%D1%85%D0%B8%D0%BC%D0%B8%D1%8F/%D0%B8%D0%BD%D0%B5%D1%80%D1%82%D0%BD%D1%8B%D0%B9%20%D0%B3%D0%B0%D0%B7"&gt;инертном газе&lt;/a&gt; можно представить молекулы материальными точками (шариками). Однако для других веществ начинает иметь значение строение молекулы, так как </paragraph><multiline_code>колебание и вращение</multiline_code> самой молекулы начинают запасать в себе значительную энергию.<paragraph></paragraph><header_2>Ссылки</header_2><list><item><hyperlink at="http://ru.wikipedia.org/wiki/%D0%9C%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D1%82%D0%BE%D1%87%D0%BA%D0%B0">WikiPedia</hyperlink></item><item><hyperlink at="http://phys.msu.ru/">ФизФак МГУ</hyperlink></item></list>'
//Wiki_processor.validate(xml)

//alert(Wiki_processor.parse('<p></p><div class="audio_player"><a href="test">abc</a></div><p></p>'))

/*
function test_hyperlink_parser(text, expected_result)
{
	var paragraph = document.createElement('paragraph')
	Wiki_processor.append_text(text, paragraph, {})
	
	console.log('input: ' + text)
	console.log('parsed: ' + paragraph.innerHTML)
	
	if (paragraph.innerHTML != expected_result)
	{
		console.log('expected: ' + expected_result)
		throw "Hyperlink parser malfunction"
	}
}

test_hyperlink_parser('Blah blah blah', 'Blah blah blah')
//test_hyperlink_parser('Blah blah blah google.ru blah blah', 'Blah blah blah <hyperlink at="http://google.ru">google.ru</hyperlink> blah blah')
//test_hyperlink_parser('Blah blah blah google/internal/resource blah blah', 'Blah blah blah <hyperlink at="http://google/internal/resource">google/internal/resource</hyperlink> blah blah')
test_hyperlink_parser('http://google.ru/banana', '<hyperlink at="http://google.ru/banana">http://google.ru/banana</hyperlink>')
test_hyperlink_parser('http://google.ru/banana blah blah', '<hyperlink at="http://google.ru/banana">http://google.ru/banana</hyperlink> blah blah')
test_hyperlink_parser('Blah blah blah http://google.ru/banana blah blah', 'Blah blah blah <hyperlink at="http://google.ru/banana">http://google.ru/banana</hyperlink> blah blah')
test_hyperlink_parser('Blah blah blah https://google.ru/banana blah blah', 'Blah blah blah <hyperlink at="https://google.ru/banana">https://google.ru/banana</hyperlink> blah blah')
test_hyperlink_parser('Blah blah blah ftp://google.ru/banana blah blah', 'Blah blah blah <hyperlink at="ftp://google.ru/banana">ftp://google.ru/banana</hyperlink> blah blah')
*/