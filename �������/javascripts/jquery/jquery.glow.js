(function($)
{
	var namespace = 'glow'
	
	$.make_external_links_glowable = function()
	{
		var $external_links = $('section a:external')
		
		$external_links.css
		({
			'text-shadow': 'rgba(0, 125, 255, 0.01) 0 0 20px'
		})
		
		$external_links.bind('mouseenter.' + namespace, function()
		{
			$(this)
				.stop(true, false) // clearQueue, jumpToEnd
				.glow_out()
		})
		
		$external_links.bind('mouseenter.' + namespace, function()
		{
			$(this)
				.stop(true, false) // clearQueue, jumpToEnd
				.glow_in()
		})
	}
	
	$(function()
	{
		$.make_external_links_glowable()
	})
})
(jQuery)