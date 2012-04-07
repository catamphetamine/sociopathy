var Vimeo =
{
	load_pictures: function()
	{
		$('.vimeo_video_picture').each(function()
		{
			var element = $(this)
			Vimeo.load_picture(element.attr('vimeo_video_id'))
		})
	},
	
	load_picture: function(id)
	{
		var url = "http://vimeo.com/api/v2/video/" + id + ".json?callback=Vimeo.show_picture"
	
		var script = document.createElement('script')
		script.type = 'text/javascript'
		script.src = url
		
		$('head').append(script)
	},
	
	show_picture: function(data)
	{
		var image = $('.vimeo_video_picture[vimeo_video_id="' + data[0].id + '"]')
		image.attr('src', data[0].thumbnail_large)
		image.css('opacity', 1)
	},
	
	Video:
	{
		id: function(url)
		{
			var regExp = /http(s)?:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/
			
			var match = url.match(regExp)
			
			if (match)
				return match[3]
		},
	
		url: function(id)
		{
			return 'https://vimeo.com/' + id
		},
		
		embed_code: function(id, options)
		{
			options = options || {}
			
			var width = options.width
			var height = options.height
			
			if (!width)
				width = Options.Video.Size.Width
		
			if (!height)
				height = Options.Video.Size.Height
			
			var source = 'http://player.vimeo.com/video/' + id + '?'
			if (options.play)
				source += 'autoplay=true' + '&'
		
			return '<iframe src="' + source + '" width="' + width + '" height="' + height + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'
		}
	}
}