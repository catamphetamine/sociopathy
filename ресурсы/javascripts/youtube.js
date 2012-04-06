var Youtube =
{
	load_pictures: function()
	{
		$('.youtube_video_picture').each(function()
		{
			var element = $(this)
			var id = element.attr('youtube_video_id')
			element.attr('src', 'http://img.youtube.com/vi/' + id + '/0.jpg')
		})
	},
	
	Video:
	{
		id: function(url)
		{
			try
			{
				return /https?:\/\/(?:[a-zA_Z]{2,3}.)?(?:youtube\.com\/watch\?)((?:[\w\d\-\_\=]+&amp;(?:amp;)?)*v(?:&lt;[A-Z]+&gt;)?=([0-9a-zA-Z\-\_]+))/i.exec(url)[2]
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
		
		embed_code: function(id, width, height)
		{
			if (!width)
				width = Options.Video.Size.Width
		
			if (!height)
				height = Options.Video.Size.Height
		
			return '<iframe width="' + width + '" height="' + height + '" src="http://www.youtube.com/embed/' + id + '" frameborder="0" allowfullscreen></iframe>'
		}
	}
}