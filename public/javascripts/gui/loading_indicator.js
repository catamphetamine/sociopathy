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
	var images_path = "images/window/loading"

	// available loading indicators
	var loading_indicators = []
	
	// tiger
	loading_indicators.push({image: "i_am_a_tiger__by_crazysexyfoosa.gif", image_source: "http://crazysexyfoosa.deviantart.com/art/i-am-a-tiger-27353780"})
	// rainy
	loading_indicators.push({image: "rainy_by_hardware-requiem.gif", image_source: "http://hardware-requiem.deviantart.com/art/naruto-25542487"})
	// fox
	loading_indicators.push({image: "flipping_foxy_by_tanidareal-d32qs68.gif", image_source: "http://tanidareal.deviantart.com/art/Flipping-foxy-186007328"})
	// running wolf
	loading_indicators.push({image: "Icon_moonrun_by_khaosdog.gif", image_source: "http://khaosdog.deviantart.com/art/Icon-moonrun-73322778"})
	
	this.initialize = function()
	{
		// create the pop up window
		loading_indicator = $("#loading_indicator").dialog
		({
			modal: true,
			autoOpen: false,
			closeOnEscape: false,
			draggable: false,
			resizable: false
		})
	}
	
	this.show = function()
	{
		refresh_loading_indicator()
		loading_indicator.dialog('open')
	}
	
	this.hide = function()
	{
		loading_indicator.dialog('close')
	}
	
	function refresh_loading_indicator()
	{
		var choise = choose_loading_indicator()
		
		$("img.loading_indicator_image", loading_indicator).attr('src', images_path + "/" + choise.image)
		$("a.loading_indicator_image_source", loading_indicator).attr("href", choise.image_source)
	}
	
	function choose_loading_indicator()
	{
		return loading_indicators[Math.floor(Math.random() * loading_indicators.length)]
	}
})()

$(document).ready(function()
{
	loading_indicator.initialize()
})
