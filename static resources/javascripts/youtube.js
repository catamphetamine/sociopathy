var Youtube =
{
	load_pictures: function(where)
	{
		if (!where)
			where = $(body)
			
		where.find('.youtube_video_picture').each(function()
		{
			var image = $(this)
			var id = image.attr('youtube_video_id')
			image.attr('src', 'http://img.youtube.com/vi/' + id + '/0.jpg')
		})
	},
	
	Video:
	{
		id: function(url)
		{
			try
			{
				return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i.exec(url)[1]
			}
			catch (error)
			{
				return null
			}
		},
		
		url: function(id)
		{
			return 'http://www.youtube.com/watch?v=' + id
		},
		
		embed_code: function(id, options)
		{
			options = options || {}
			
			var width = options.width
			var height = options.height

			if (!width)
				width = 560
		
			if (!height)
				height = 315
			
			var source = 'http://www.youtube.com/embed/' + id + '?' + 'wmode=opaque' + '&'
			
			if (options.play)
				source += 'autoplay=1' + '&'
				
			source += 'rel=0' + '&'
		
			return '<iframe width="' + width + '" height="' + height + '" src="' + source + '" frameborder="0" allowfullscreen></iframe>'
		}
	}
}