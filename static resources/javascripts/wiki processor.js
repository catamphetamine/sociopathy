var Wiki_processor = new (new Class
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
		
		var result = $.validate_xml(xml)
		
		if (!result)
			return
		
		if (!result.cause)
		{
			var document = $(result)
			
			var inner_paragraph = document.find('paragraph paragraph')
			if (inner_paragraph.exists())
				throw { ошибка: 'Нарушено форматирование текста: абзац внутри абзаца', explanation: inner_paragraph.outer_html() , verbose: true }
			
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
			
			xml = $('<wiki/>').html(xml).node()
		}
		
		var processor = this
		var output = $('<xml/>')
		
		Array.for_each(xml.childNodes, function()
		{
			processor.simplify_node(this, output.node(), options)
		})
		
		return output.html().trim()
	},
			
	simplify_node: function(node, target, options)
	{
		var processor = this
		
		//console.log('simplify_node')
		//console.log(node)
		
		//console.log('target')
		//console.log(target)
		
		var element
		if (!Dom_tools.is_text_node(node))
			element = $(node)
	
		var syntax
		if (element)
			syntax = processor.get_syntax_by_translation(node.tagName.toLowerCase())
			
		//console.log('element')
		//console.log(element)
		
		/*
		if (Dom_tools.is_text_node(node))
			console.log(node)
		else
			console.log(element.outer_html())
		*/
			
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
			return Dom_tools.append_text(Dom_tools.to_text(node), target)
	
		//console.log('syntax found')
		
		var is_root_node = node.parentNode.parentNode === null
		
		//console.log('is root node?')
		//console.log(is_root_node)
		
		var simplified
		if (syntax.simplified)
		{
			simplified = syntax.simplify(element, { is_last: target.lastChild === node })
		}
		else if (is_root_node)
		{
			simplified = ''
		}
		else
			simplified = element.text()
		
		if (is_root_node)
		{
			if (target.firstChild !== node)
				simplified = '\n\n' + simplified
		}
		
		//console.log('simplified')
		//console.log(simplified)
		
		//target = $(target)
		
		//if (options.process_element)
		//	options.process_element(html_element, element)
		
		//html_element.attr('author', element.attr('author'))
		var simplified_node = document.createTextNode(simplified)
		target.appendChild(simplified_node)
		
		//if (syntax.activate)
		//	syntax.activate(html_element)
		
		if (syntax.break_simplification)
			return
		
		//console.log(html_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			//console.log(this)
			//console.log(html_element.node())
			processor.simplify_node(this, simplified_node, options)
		})
		
		//console.log('finished processing children')
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
			xml = $('<wiki/>').html(xml).node()
		}
		
		var processor = this
		var output = $('<xml/>')
		
		Array.for_each(xml.childNodes, function()
		{
			processor.decorate_node(this, output.node(), options)
		})
		
		return output.html()
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
		
		var element
		if (!Dom_tools.is_text_node(node))
			element = $(node)
	
		var syntax
		if (element)
			syntax = processor.get_syntax_by_translation(node.tagName.toLowerCase())
			
		//console.log('element')
		//console.log(element)
			
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
		{
			if (target.tagName.toLowerCase() === 'xml')
				return
			
			return Dom_tools.append_text(Dom_tools.to_text(node), target)
		}
	
		//console.log('syntax found')
		
		var html_element
		if (syntax.html_tag)
		{
			html_element = $('<' + syntax.html_tag + '/>')
			if (syntax.decorate)
				syntax.decorate(element, html_element)
		}
		else
			html_element = syntax.decorate(element)
		
		target = $(target)
		
		if (options.process_element)
			options.process_element(html_element, element)
		
		//html_element.attr('author', element.attr('author'))
		html_element.appendTo(target)
		
		//if (syntax.activate)
		//	syntax.activate(html_element)
		
		if (syntax.break_decoration)
			return
		
		//console.log(html_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			processor.decorate_node(this, html_element.node(), options)
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
			xml = $('<xml/>').html(xml)
		
		//xml.find('.hint').remove()
		xml = xml.node()
		
		var processor = this
		var output = $('<wiki/>')
		
		function finish()
		{
			output.find('paragraph').each(function()
			{
				var paragraph = $(this)
				
				trim_element(paragraph)
				
				if (paragraph.is_empty())
					paragraph.remove()
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
				processor.parse_node(this, output.node(), options, callback)
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
		
		var element
		if (!Dom_tools.is_text_node(node))
		{
			element = $(node)
			
			if (element.is('br')) // && element.parent().is('p'))
				return finished()
		}
	
		var syntax
		if (element)
			syntax = processor.find_syntax_for(element)
		
		//console.log('element')
		//console.log(element)
			
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
			
			return this.append_text(Dom_tools.to_text(node), target, { parse: is('абзац') || is('автор') || is('текст') }, callback)
		}
	
		if (syntax.is_dummy)
			if (syntax.is_dummy(element))
				return finished()
		
		var wiki_element
		if (!syntax.translation)
			wiki_element = $('<' + syntax.tag + '/>')
		else if (typeof syntax.translation === 'string')
			wiki_element = $('<' + syntax.translation + '/>')
		else
			wiki_element = $('<' + Object.key(syntax.translation) + '/>')
			
		if (syntax.parse)
			syntax.parse(element, wiki_element)
		
		target = $(target)
		
		if (options.process_element)
			options.process_element(wiki_element, element)
		
		if (syntax.content_required)
			if (element.is_empty())
				return finished()
		
		wiki_element.appendTo(target)
		
		if (syntax.break_parsing)
			return finished()
		
		//console.log(wiki_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		function finish()
		{
			trim_element(wiki_element)
			
			if (syntax.finish)
				syntax.finish(wiki_element)
		}
		
		function iterate(callback)
		{
			var wiki_node = wiki_element.node()
			
			Array.for_each(node.childNodes, function()
			{
				processor.parse_node(this, wiki_node, element, function(result)
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
			return Dom_tools.append_text(text, to())
			
		function just_append_text()
		{
			Dom_tools.append_text(text, to())
			callback(to())
		}
	
		function can_contain_hyperlinks()
		{
			return text.contains('http://') || text.contains('https://') || text.contains('ftp://')
		}
		
		if (!options.parse || !can_contain_hyperlinks())
			return just_append_text()
	
		function append(what, separator)
		{
			if (typeof what === 'string')
				Dom_tools.append_text(what, to())
			else
				to().appendChild(what)
			
			if (typeof separator !== 'undefined')
				Dom_tools.append_text(separator, to())
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
		
		var fragments = text.split(/(\s)/)
		var fragments_and_separators = []
		
		var i = 0
		while (i < fragments.length)
		{
			var fragment = fragments[i]
			var separator = fragments[i + 1]
		
			if (fragment.trim().length === 0)
			{
				i += 2
				continue
			}
		
			fragments_and_separators.push({ fragment: fragment, separator: separator })
			fragments.remove_at(i + 1)
			i++
		}
		
		//console.log(fragments_and_separators)
		
		var countdown = Countdown(fragments_and_separators.length, function()
		{
			append_pure_text()
			callback(to())
		})
		
		function is_pure_text_block(block)
		{
			pure_text_blocks.add(block)
			countdown()
		}
		
		fragments_and_separators.for_each(function()
		{
			if (!Smart_parser.is_a_link(this.fragment))
				return is_pure_text_block(this)
		
			append_pure_text()
			
			Smart_parser.ссылка_на_картинку(this.fragment, (function(result)
			{
				if (!result.error)
				{
					var tag = Object.key(Wiki_processor.Syntax.картинка.translation)
					
					var width = Wiki_processor.Syntax.картинка.translation[tag].ширина
					var height = Wiki_processor.Syntax.картинка.translation[tag].высота
					
					var picture = $('<' + tag + '/>')
					
					picture.attr(width, result.width)
					picture.attr(height, result.height)
					
					picture.text(decodeURI(this.fragment))
						
					append(picture.node(), this.separator)
					return countdown()
				}
				
				if (Smart_parser.ссылка_на_видео_на_youtube(this.fragment)
				    && to().tagName.toLowerCase() === 'paragraph')
				{
					var tag = 'youtube'
					
					var video = $('<' + tag + '/>')
					video.html(Youtube.Video.id(this.fragment))
						
					video.insert_after(to())
					target = $('<paragraph/>').appendTo(to().parentNode).node()
					
					return countdown()
				}
				
				if (Smart_parser.ссылка_на_видео_на_vimeo(this.fragment)
				    && to().tagName.toLowerCase() === 'paragraph')
				{
					var tag = 'vimeo'
					
					var video = $('<' + tag + '/>')
					video.html(Vimeo.Video.id(this.fragment))
						
					video.insert_after(to())
					target = $('<paragraph/>').appendTo(to().parentNode).node()
					
					return countdown()
				}
			
				var link = Smart_parser.просто_ссылка(this.fragment)
					
				append(link.node(), this.separator)
				
				return countdown()
			})
			.bind(this))
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
		
		$(html).appendTo('body')
		
		//console.log('*** parsing html ***')
		
		this.parse(html, function(same_wiki)
		{
			same_wiki = same_wiki.replace_all('&lt;', '<').replace_all('&gt;', '>')
			
			//console.log('*** wiki ***')
			//console.log(same_wiki)
			
			$('<pre/>').text(same_wiki).appendTo('body')
			
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
			if (element.hasClass('hint'))
				return true
		},
		
		decorate: function(from, to)
		{
			var alignment
			switch (from.attr('alignment'))
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
				to.css('text-align', alignment)
			
			return to
		},
		
		parse: function(from, to)
		{
			var выравнивание
			switch (from.css('text-align'))
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
				to.attr('alignment', выравнивание)
			
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
			if (element.find('> .text').hasClass('hint'))
				return true
			
			if (element.find('> .text').is_empty())
				return true
		},
	
		decorate: function(from, to)
		{
			return to.addClass('citation')
		}
	},
	текст:
	{
		translation: 'text',
		selector: '.citation > .text',
		html_tag: 'div',
		
		decorate: function(from, to)
		{
			return to.addClass('text')
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
			return ' (' + from.text() + ')'
		},
		
		is_dummy: function(element)
		{
			if (element.hasClass('hint'))
				return true
			
			if (element.is_empty())
				return true
		},
		
		decorate: function(from, to)
		{
			return to.addClass('author')
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
			if (element.hasClass('hint'))
				return true
		}
	},
	жирный:
	{
		translation: 'bold',
		selector: 'b',
		html_tag: 'b',
		content_required: true
	},
	курсив:
	{
		translation: 'italic',
		selector: 'i',
		html_tag: 'i',
		content_required: true
	},
	список:
	{
		translation: 'list',
		selector: 'ul',
		html_tag: 'ul',
		
		is_dummy: function(element)
		{
			if ($(element.node().firstChild).hasClass('hint'))
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
			if (element.hasClass('hint'))
				return true
			
			if (element.html().trim() === '')
				return true
		},
		
		simplify: function(from, info)
		{
			var text = from.text()
			
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
			if (element.hasClass('hint'))
				return true
			
			if (element.html().trim() === '')
				return true
		},
		
		decorate: function(from, to)
		{
			var url = from.attr('at')
			
			to.attr
			({
				type: 'hyperlink',
				href: url
			})
			
			if (!is_internal_url(url))
				to.attr('target', '_blank')
			
			return to
		},
		
		parse: function(from, to)
		{
			var url = decodeURI(from.attr('href'))
			
			if (is_external_internal_url(url))
				url = is_external_internal_url(url)
				
			to.attr('at', url)
			
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
			switch (from.attr('float'))
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
			
			to.css('float', float)
			
			return to.attr
			({
				src: from.html(),
				width: from.attr('width'),
				height: from.attr('height'),
				type: 'picture'
			})
		},
		
		parse: function(from, to)
		{
			to.attr
			({
				width: from.attr('width'),
				height: from.attr('height')
			})
			
			var положение
			switch (from.css('float'))
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
			
			to.attr('float', положение)
			
			return to.html(from.attr('src'))
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
			to.addClass('tex')
			
			if (from.attr('display') === 'в строке')
			{
				to.html(delimit_formula(from.html(), 'inline'))
				to.css('display', 'inline')
			}
			else
			{
				to.html(delimit_formula(from.html(), 'block'))
				to.css('display', 'block')
			}
			
			return to.attr
			({
				type: 'formula',
				formula: from.html()
			})
		},
		
		parse: function(from, to)
		{
			to.html(from.attr('formula'))
			
			if (from.css('display') === 'inline')
				to.attr('display', 'в строке')
			else
				to.attr('display', 'вне строки')
			
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
			if (element.hasClass('hint'))
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
			if (element.hasClass('hint'))
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
			if (element.hasClass('hint'))
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
			if (element.hasClass('hint'))
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
			var url = from.text()
			to.addClass('audio_player')
			var link = to.audio_player('link', { url: url, title: from.attr('title') })
			link.appendTo(to)
			to.attr('type', 'audio')
		},
		
		break_parsing: true,
		break_decoration: true,
		
		parse: function(from, to)
		{
			to.attr('title', from.audio_player('title'))
			return to.text(from.audio_player('url'))
		}
	},
	youtube:
	{
		selector: '.video_player[hosting="youtube"]',
		
		decorate: function(from)
		{
			var video_player = $('<div/>').addClass('video_player').attr('hosting', 'youtube')
			video_player.html($(Youtube.Video.embed_code(from.html())).attr('type', 'video'))
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
			
			var iframe = from.find('> iframe')
			
			var src = iframe.attr('src')
			if (!src.starts_with(url))
				throw 'Invalid youtube video source: ' + src
			
			var id = src.substring(url.length)
			if (id.has('?'))
				id = id.substring(0, id.indexOf('?'))
			
			return to.html(id)
		}
	},
	vimeo:
	{
		selector: '.video_player[hosting="vimeo"]',
		
		decorate: function(from)
		{
			var video_player = $('<div/>').addClass('video_player').attr('hosting', 'vimeo')
			video_player.html($(Vimeo.Video.embed_code(from.html())).attr('type', 'video'))
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
			
			var iframe = from.find('> iframe')
			
			var src = iframe.attr('src')
			if (!src.starts_with(url))
				throw 'Invalid vimeo video source: ' + src
			
			var id = src.substring(url.length)
			if (id.has('?'))
				id = id.substring(0, id.indexOf('?'))
			
			return to.html(id)
		}
	}
}

var Smart_parser = new (new Class
({
	is_a_link: function(text)
	{
		if (!text.contains('http://') && !text.contains('https://') && !text.contains('ftp://'))
			return false
				
		var uri = Uri.parse(text)
			
		if (uri.protocol === 'ftp')
		{
			return true
		}
		else if (uri.protocol === 'http' || uri.protocol === 'https')
		{
			//if (проверить ссылку)
			return true
		}
	},
	
	ссылка_на_картинку: function(url, callback)
	{
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
		
		var link = $('<' + tag + '/>')
		link.attr(at, url)
		link.text(url)
		
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
