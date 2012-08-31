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
	
	decorate: function(xml)
	{
		if (typeof(xml) === 'string')
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
			
			//console.log(xml)
			xml = $('<wiki/>').html(xml).node()
		}
		
		var processor = this
		var output = $('<xml/>')
		
		Array.for_each(xml.childNodes, function()
		{
			processor.decorate_node(this, output.node())
		})
		
		return output.html()
	},
			
	decorate_node: function(node, target)
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
			return Dom_tools.append_text(Dom_tools.to_text(node), target)
	
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
		html_element.attr('author', element.attr('author'))
		html_element.appendTo(target)
		
		//console.log(html_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			//console.log(this)
			//console.log(html_element.node())
			processor.decorate_node(this, html_element.node())
		})
		
		//console.log('finished processing children')
	},
	
	parse: function(xml)
	{
		if (typeof(xml) === 'string')
			xml = $('<xml/>').html(xml).node()
		
		var processor = this
		var output = $('<wiki/>')
		
		Array.for_each(xml.childNodes, function()
		{
			processor.parse_node(this, output.node())
		})
		
		var xml = output.html()
		
//		xml = xml.replace_all('<br>', '\n')
//		xml = xml.replace_all('<br/>', '\n')

		xml = xml.replace_all('&lt;br&gt;', '')
		xml = xml.replace_all('&lt;br/&gt;', '')
	
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
	},
			
	parse_node: function(node, target)
	{
		//if (this.timer < new Date().getTime())
		//	return
		
		var processor = this
		
		//console.log('parse_node')
		//console.log(node)
		
		//console.log('target')
		//console.log(target)
		
		var element
		if (!Dom_tools.is_text_node(node))
			element = $(node)
	
		var syntax
		if (element)
			syntax = processor.find_syntax_for(element)
		
		//console.log('element')
		//console.log(element)
			
		//console.log('syntax')
		//console.log(syntax)
		
		if (!syntax)
			return Dom_tools.append_text(Dom_tools.to_text(node), target)
	
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
		wiki_element.attr('author', element.attr('author'))
		wiki_element.appendTo(target)
		
		if (syntax.break)
			return
		
		//console.log(wiki_element)
		//console.log('process children')
		//console.log(node.childNodes)
		
		Array.for_each(node.childNodes, function()
		{
			processor.parse_node(this, wiki_element.node())
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
		
		var same_wiki = this.parse(html)
		same_wiki = same_wiki.replace_all('&lt;', '<').replace_all('&gt;', '>')
		
		//console.log('*** wiki ***')
		//console.log(same_wiki)
		
		$('<pre/>').text(same_wiki).appendTo('body')
		
		if (same_wiki != wiki)
			throw 'Wiki processor malfunction'
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
		translation: 'paragraph',
		selector: 'p',
		html_tag: 'p'
	},
	выдержка:
	{
		translation: 'citation',
		selector: 'div.citation',
		html_tag: 'div',
		
		decorate: function(from, to)
		{
			return to.addClass('citation')
		}
	},
	текст:
	{
		translation: 'text',
		selector: 'div.citation > span.text',
		html_tag: 'span',
		
		decorate: function(from, to)
		{
			return to.addClass('text')
		}
	},
	автор:
	{
		translation: 'author',
		selector: 'div.citation > div.author',
		html_tag: 'div',
		
		decorate: function(from, to)
		{
			return to.addClass('author')
		}
	},
	заголовок_2:
	{
		translation: 'header_2',
		selector: 'h2',
		html_tag: 'h2'
	},
	жирный:
	{
		translation: 'bold',
		selector: 'b',
		html_tag: 'b'
	},
	курсив:
	{
		translation: 'italic',
		selector: 'i',
		html_tag: 'i'
	},
	список:
	{
		translation: 'list',
		selector: 'ul',
		html_tag: 'ul'
	},
	пункт:
	{
		translation: 'item',
		selector: 'li',
		html_tag: 'li'
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
		
		decorate: function(from, to)
		{
			return to.attr
			({
				type: 'hyperlink',
				href: from.attr('at')
			})
		},
		
		parse: function(from, to)
		{
			return to.attr('at', from.attr('href'))
		}
	},
	картинка:
	{
		translation:
		{
			'picture':
			{
				ширина: 'width',
				высота: 'height'
			}
		},
		selector: 'img[type="picture"]',
		html_tag: 'img',
		
		decorate: function(from, to)
		{
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
			
			return to.html(from.attr('src'))
		}
	},
	формула:
	{
		translation:
		{
			'formula':
			{
				ширина: 'width',
				высота: 'height'
			}
		},
		selector: 'img[type="formula"]',
		html_tag: 'img',
		
		decorate: function(from, to)
		{
			var url = 'http://chart.apis.google.com/chart?cht=tx&chs=28&chl='
			return to.attr
			({
				src: url + from.html(),
				type: 'formula',
				width: from.attr('width'),
				height: from.attr('height')
			})
		},
		
		parse: function(from, to)
		{
			var url = 'http://chart.apis.google.com/chart?cht=tx&chs=28&chl='
			//var url = 'http://chart.apis.google.com/chart?cht=tx&amp;chs=28&amp;chl='
			
			var src = from.attr('src')
			
			if (!src.starts_with(url))
				throw 'Invalid formula image source: ' + src
			
			var formula = src.substring(url.length)
			
			to.attr
			({
				width: from.attr('width'),
				height: from.attr('height')
			})
				
			return to.html(formula)
		}
	},
	снизу:
	{
		translation: 'subscript',
		selector: 'sub',
		html_tag: 'sub'
	},
	сверху:
	{
		translation: 'superscript',
		selector: 'sup',
		html_tag: 'sup'
	},
	код:
	{
		translation: 'code',
		selector: 'code',
		html_tag: 'code'
	},
	многострочный_код:
	{
		translation: 'multiline_code',
		selector: 'pre',
		html_tag: 'pre'
	},
	youtube:
	{
		selector: 'iframe[src^="http://www.youtube.com/embed/"]',
		
		decorate: function(from)
		{
			return $(Youtube.Video.embed_code(from.html()))
		},
		
		break: true,
		
		parse: function(from, to)
		{
			var url = 'http://www.youtube.com/embed/'
			
			var src = from.attr('src')
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
		selector: 'iframe[src^="http://player.vimeo.com/video/"]',
		
		decorate: function(from)
		{
			return $(Vimeo.Video.embed_code(from.html()))
		},
		
		break: true,
	
		parse: function(from, to)
		{
			var url = 'http://player.vimeo.com/video/'
			
			var src = from.attr('src')
			if (!src.starts_with(url))
				throw 'Invalid vimeo video source: ' + src
			
			var id = src.substring(url.length)
			if (id.has('?'))
				id = id.substring(0, id.indexOf('?'))
			
			return to.html(id)
		}
	}
}