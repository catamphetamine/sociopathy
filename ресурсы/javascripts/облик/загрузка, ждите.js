/**
 * Loading indicator
 * 
 * This script creates ajax loading indicator
 * 
 * Requires jQuery. 
 * 
 * Distributed under GNU General Public License
 * http://www.gnu.org/licenses/gpl.html
 * 
 * @author Kuchumov Nikolay
 * @email kuchumovn@gmail.com
 * @github kuchumovn
 */

var loading_indicator = new (function()
{
	// loading indicator pop up window
	var loading_indicator

	// animations path
	var images_path = "/картинки/лиса"

	// available loading indicators
	var frames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
	
	var current_frame_index = 0
	
	var Interval = 40
	var Ellipsis_ticking_interval = 500
	
	this.initialize = function()
	{
		// create the pop up window
		loading_indicator = $('#loading_indicator')
		
		var frames_container = loading_indicator.find('.frames')
		
		frames.forEach(function(frame, i)
		{
			frames[i] = $('<div/>').addClass('frame').css('background-image', 'url("' + images_path + '/' + frame + '.png' + '")').appendTo(frames_container)
		})
		
		this.content = frames_container.parent()
		this.ellipsis = this.content.find('.ellipsis')
	}
	
	this.start_animation = function()
	{
		// на всякий случай, вдруг stop не вызовется
		this.stop_animation()
		
		this.animator = this.switch_frame.bind(this).ticking(Interval)
		this.ellipsis_animator = this.switch_ellipsis_frame.bind(this).ticking(Ellipsis_ticking_interval)
	}
	
	this.stop_animation = function()
	{
		if (this.animator)
		{
			this.animator.stop()
			this.animator = null
		}
		
		if (this.ellipsis_animator)
		{
			this.ellipsis_animator.stop()
			this.ellipsis_animator = null
		}
	}
	
	this.switch_frame = function()
	{
		this.current_frame().css('visibility', 'hidden')
		this.next_current_frame_index()
		this.current_frame().css('visibility', 'visible')
	}
	
	this.switch_ellipsis_frame = function()
	{
		var text = this.ellipsis.text()
		
		if (text.length < 3)
			text += '.'
		else
			text = ''
			
		this.ellipsis.text(text)
	}
	
	this.next_current_frame_index = function()
	{
		if (current_frame_index < frames.length - 1)
			current_frame_index++
		else
			current_frame_index = 0
	}
	
	this.current_frame = function()
	{
		return frames[current_frame_index]
	}
	
	this.show = function()
	{
		var loader = this
		
		var loading =
		{
			shown: true,
			
			show: function()
			{
				Клавиши.disable()
				
				loading_indicator.css('z-index', z_indexer.acquire_top_z())
				
				loading_indicator.fade_in(1.0, function()
				{
					loader.start_animation()
					loader.content.fade_in(3.0)
					$('body').addClass('blurred')
				})
				
				return loading
			},
			
			hide: function()
			{
				this.shown = false
				
				loading_indicator.fade_out(0.3, function()
				{
					loader.content.fade_out(0)
					loader.stop_animation()
				})
				$('body').removeClass('blurred')
				Клавиши.enable()
			}
		}
		
		return loading.show()
	}
})()

$(document).on('page_loaded', function()
{
	loading_indicator.initialize()
})

/*
$(document).on('page_loaded', function()
{
	setTimeout(function()
	{
		loading_indicator.show()
	}, 1000)
})
*/