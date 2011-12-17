/**
 * Loading indicator
 * 
 * This script creates ajax loading indicator
 * 
 * Usage:
 * 
 * loading_indicator.show()
 * loading_indicator.hide()
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
	var images_path = "/картинки/window/loading"

	// available loading indicators
	var loading_indicators = []
	
	// rainy
	loading_indicators.push({image: "rainy_by_hardware-requiem.gif", image_source: "http://hardware-requiem.deviantart.com/art/naruto-25542487", width: 120, height: 120})
	// fox
	loading_indicators.push({image: "flipping_foxy_by_tanidareal-d32qs68.gif", image_source: "http://tanidareal.deviantart.com/art/Flipping-foxy-186007328", width: 100, height: 100})
	// running wolf
	loading_indicators.push({image: "Icon_moonrun_by_khaosdog.gif", image_source: "http://khaosdog.deviantart.com/art/Icon-moonrun-73322778", width: 100, height: 100})
	
	this.initialize = function()
	{
		// create the pop up window
		loading_indicator = $("#loading_indicator").dialog_window()
	}
	
	this.show = function()
	{
		this.refresh_loading_indicator()
		loading_indicator.open()
	}
	
	this.hide = function()
	{
		loading_indicator.close()
	}
	
	this.refresh_loading_indicator = function()
	{
		var choise = this.choose_loading_indicator()
		
		var image = $("img.loading_indicator_image", loading_indicator.$element)
		
		image.css
		({
			width: choise.width + 'px',
			height: choise.width + 'px'
		})
		
		image.attr('src', images_path + "/" + choise.image)

		$("a.loading_indicator_image_source", loading_indicator.$element).attr("href", choise.image_source)
	}
	
	this.choose_loading_indicator = function()
	{
		return loading_indicators[Number.random(0, loading_indicators.length - 1)]
	}
})()

$(function()
{
	loading_indicator.initialize()
})
