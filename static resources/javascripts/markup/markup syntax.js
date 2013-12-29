Markup.Syntax =
{
	абзац:
	{
		translation:
		{
			paragraph:
			{
				выравнивание: 'alignment'
			}
		}
	},
	выдержка:
	{
		translation: 'citation'
	},
	текст:
	{
		translation: 'text'
	},
	автор:
	{
		translation: 'author',
		
		simplify: function(from)
		{
			return ' (' + Dom.text(from) + ')'
		}
	},
	заголовок_2:
	{
		translation: 'header_2'
	},
	жирный:
	{
		translation: 'bold'
	},
	курсив:
	{
		translation: 'italic'
	},
	список:
	{
		translation: 'list'
	},
	пункт:
	{
		translation: 'item',
		
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
		
		break_simplification: true,
		
		simplify: function(from)
		{
			return '(картинка)'
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
		
		break_simplification: true,
		
		simplify: function(from)
		{
			return '(формула)'
		}
	},
	снизу:
	{
		translation: 'subscript'
	},
	сверху:
	{
		translation: 'superscript'
	},
	код:
	{
		translation: 'code'
	},
	многострочный_код:
	{
		translation: 'multiline_code'
	},
	перевод_строки:
	{
		translation: 'break_line'
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
		
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(аудиозапись)'
		}
	},
	youtube:
	{
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(видеозапись)'
		}
	},
	vimeo:
	{
		break_simplification: true,
		
		simplify: function(from, info)
		{
			return '(видеозапись)'
		}
	}
}