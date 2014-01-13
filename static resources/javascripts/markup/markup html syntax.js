Markup.Options =
{
	Picture:
	{
		iPhone:
		{
			max_width: 280,
			
			chat:
			{
				max_width: 202
			}
		}
	},
	
	Video_player:
	{
		iPhone:
		{
			width: 280, // 320
			height: 158, // 180
			
			chat:
			{
				width: 202,
				height: 114
			}
		}
	}
}

Markup.Syntax.html =
{
	абзац:
	{
		selector: 'p',
		tag: 'p',
		
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
		selector: 'div.citation',
		tag: 'div',
		
		is_dummy: function(element)
		{
			var text = element.querySelector('.text')
			
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
		selector: '.citation > .text',
		tag: 'q',
		
		decorate: function(from, to)
		{
			return to.classList.add('text')
		}
	},
	автор:
	{
		selector: '.citation > .author',
		tag: 'div',
	
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
		selector: 'h2',
		tag: 'h2',
		
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	жирный:
	{
		selector: 'strong',
		tag: 'strong',
		
		content_required: true
	},
	курсив:
	{
		selector: 'em',
		tag: 'em',
		
		content_required: true
	},
	список:
	{
		selector: 'ul',
		tag: 'ul',
		
		is_dummy: function(element)
		{
			if (element.firstChild.classList.contains('hint'))
				return true
		}
	},
	пункт:
	{
		selector: 'li',
		tag: 'li',
		
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
		selector: 'a[type="hyperlink"]',
		tag: 'a',
		
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
		selector: 'img[type="picture"]',
		tag: 'img',
	
		break_decoration: true,
		
		decorate: function(from, to, decoration_options)
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
			
			var width = from.getAttribute('width')
			var height = from.getAttribute('height')
			
			if (decoration_options.device)
			{
				var measurements = Markup.Options.Picture[decoration_options.device]
				if (measurements)
				{
					if (decoration_options.view)
						measurements = measurements[decoration_options.view]
						
					if (width > measurements.max_width)
					{
						var factor = measurements.max_width / width;
						
						width = measurements.max_width
						height *= factor
					}
				}
			}
			
			to.setAttribute('width', width)
			to.setAttribute('height', height)
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
		selector: '.tex[type="formula"]',
		tag: 'span',
		
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
		selector: 'sub',
		tag: 'sub',
		
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	сверху:
	{
		selector: 'sup',
		tag: 'sup',
		
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	код:
	{
		selector: 'code',
		tag: 'code',
		
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	многострочный_код:
	{
		selector: 'pre',
		tag: 'pre',
		
		content_required: true,
		
		is_dummy: function(element)
		{
			if (element.classList.contains('hint'))
				return true
		}
	},
	перевод_строки:
	{
		selector: 'br',
		tag: 'br'
	},
	audio:
	{
		selector: 'div.audio_player',
		tag: 'div',
		
		decorate: function(from, to)
		{
			var url = Dom.text(from)
			
			var link = Audio_player.link({ url: url, title: from.getAttribute('title') })
			to.appendChild(link)
			
			to.classList.add('audio_player')
			to.setAttribute('type', 'audio')
		},
		
		break_parsing: true,
		break_decoration: true,
		
		parse: function(from, to)
		{
			to.setAttribute('title', Audio_player.title(from))
			Dom.text(to, text(Audio_player.url(from)))
			return to
		}
	},
	youtube:
	{
		selector: '.video_player[hosting="youtube"]',
		
		decorate: function(from, decoration_options)
		{
			var video_player = document.createElement('div')
			
			video_player.classList.add('video_player')
			
			video_player.setAttribute('hosting', 'youtube')
			
			options = {}
			
			if (decoration_options.device)
			{
				var measurements = Markup.Options.Video_player[decoration_options.device]
				if (measurements)
				{
					if (decoration_options.view)
						measurements = measurements[decoration_options.view]
						
					options.width = measurements.width
					options.height = measurements.height
				}
			}
			
			video_player.innerHTML = Youtube.Video.embed_code(from.innerHTML, options)
			video_player.firstChild.setAttribute('type', 'video')
			
			return video_player
		},
		
		break_parsing: true,
		break_decoration: true,
		
		parse: function(from, to)
		{
			var url = 'http://www.youtube.com/embed/'
			
			var iframe = from.querySelector('iframe')
			
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
		
		decorate: function(from, decoration_options)
		{
			var video_player = document.createElement('div')
			
			video_player.classList.add('video_player')
			
			video_player.setAttribute('hosting', 'vimeo')
			
			options = {}
			
			if (decoration_options.device)
			{
				var measurements = Markup.Options.Video_player[decoration_options.device]
				if (measurements)
				{
					if (decoration_options.view)
						measurements = measurements[decoration_options.view]
						
					options.width = measurements.width
					options.height = measurements.height
				}
			}
			
			video_player.innerHTML = Vimeo.Video.embed_code(from.innerHTML, options)
			video_player.firstChild.setAttribute('type', 'video')
			
			return video_player
		},
		
		break_parsing: true,
		break_decoration: true,
	
		parse: function(from, to)
		{
			var url = 'http://player.vimeo.com/video/'
			
			var iframe = from.querySelector('iframe')
			
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