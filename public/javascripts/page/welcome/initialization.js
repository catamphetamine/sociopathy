var join_dialog
var gender_chooser
var joined_message
var join_form_slider

// activate join button
function initialize_join_button()
{
	image_button_fader.activate
	(
		"join_button", 
		{
			path: "images/page/welcome",
			"button name": "join button",
			width: 345,
			height: 59
		},
		{				
			action: function(button) { join_dialog.dialog('open') },
			delay: "2x"
		}
	)
}

// create join dialog
function initialize_join_dialog()
{
	join_dialog = $("#join_dialog").dialog
	({
		modal: true,
		width: 720,
		autoOpen: false,
		closeOnEscape: false,
		draggable: false,
		resizable: false
	})
}

// create join dialog slider
function initialize_join_form_slider()
{
	join_form_slider = new form_slider
	({
		id: "join_dialog_slider",
		width: 640,
		height: 200,
		"next button": $("#" + join_dialog.attr('id') + " span[subtype='next']"),
		"done button": $("#" + join_dialog.attr('id') + " span[subtype='done']"),
		"fader": button_fader,
		fields:
		{
			name:
			{
				validate: function(name) { if (name.length == 0) throw new custom_error($._("page 'welcome', dialog 'join', error, name, empty")) }
			},
			gender:
			{
				control: gender_chooser,
			}
		}
	})
	
	join_form_slider.activate()
}

// create gender chooser
function initialize_gender_chooser()
{
	gender_chooser = new image_chooser()
	gender_chooser.activate
	(
		"join_form_gender_chooser",
		{
			path: "images/page/welcome/dialog/join/gender",
			width: 64,
			height: 64,
			target: "join_form_gender"
		}
	)
}

// create joined message dialog
function initialize_joined_message()
{
	joined_message = $("#joined_message").dialog
	({
		modal: true,
		width: 720,
		autoOpen: false,
		closeOnEscape: false,
		draggable: false,
		resizable: false
	})				
}

// activate buttons
function activate_buttons()
{
	text_button_fader.activate_all("images/button", 
	{
		cancel: 
		{
			icon: "cross",
			"top offset": 13,
			action: function() { close_window(join_dialog); join_form_slider.reset(); },
			delay: "2x"
		},
		next: 
		{
			icon: "right arrows",
			floating: "right",
			"top offset": 14,
			action: function() { join_form_slider.next(this) }
		},
		done: 
		{
			icon: "check",
			floating: "left",
			"top offset": 15,
			action: function() { join_submission(join_form_slider.data()) },
			delay: "2x"						
		}
	})
}

function initialize_page()
{
	initialize_join_button()
	initialize_join_dialog()
	initialize_join_form_slider()
	initialize_gender_chooser()
	initialize_joined_message()
	activate_buttons()
}

//	$("#input_field").Watermark('text', $("#field_watermark").css("color"))			
