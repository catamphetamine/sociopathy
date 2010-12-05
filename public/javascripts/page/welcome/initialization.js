var join_dialog
var gender_chooser
var joined_message
var join_form_slider

// activate join button
function initialize_join_button()
{
	button.classic_button(new image_button
	(
		"join_button", 
		{
			path: "images/page/welcome",
			"button name": "join button",
			width: 345,
			height: 59,
			action: function(button) { open_window(join_dialog) },
			delay: "1x"
		}
	))
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
		resizable: false, stack: false
	})
	
	join_dialog.reset = function() {}
}

// create join dialog slider
function initialize_join_form_slider()
{
	join_form_slider = new form_slider
	({
		id: "join_dialog_slider",
		width: 640,
		height: 200,
		"next button": $("#join_dialog_next_button"),
		"done button": $("#join_dialog_done_button"),
		fader: button.fader,
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
	gender_chooser = new image_chooser
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

function activate_buttons()
{
	return Array.prototype.slice.call(arguments).map(function(options)
	{
		var element = $('#' + options.id)

		return button.classic_button(new text_button
		(
			element,
			Object.append
			(
				{
					path: 'images/button',
					height: 59,
					'side bar size': 44,
					
					'button name':  element.attr('type'), // || 'generic',
				},
				options
			)
		))
	})
}

function initialize_page()
{
	initialize_join_button()
	initialize_join_dialog()
	initialize_gender_chooser()
	initialize_joined_message()
	
	var join_dialog_buttons = activate_buttons
	(
		{
			id: 'join_dialog_cancel_button',
			icon: "cross",
			'icon width': 30,
			'icon height': 30,
			'icon top offset': 5,
			action: function() { close_window(join_dialog) },
			delay: "1x"
		},
		{
			id: 'join_dialog_next_button',
			icon: "right arrows",
			'icon width': 40,
			'icon height': 30,
			'icon floating': "right",
			'icon top offset': 6,
			action: function() { join_form_slider.next(this) }
		},
		{
			id: 'join_dialog_done_button',
			icon: "check",
			'icon width': 24,
			'icon height': 24,
			'icon top offset': 7,
			action: function() { join_submission(join_form_slider.data()) },
			delay: "1x"
		}
	)
	
//	join_dialog.add_controls(join_dialog_buttons, join_form_slider)

	initialize_join_form_slider()
}

//	$("#input_field").Watermark('text', $("#field_watermark").css("color"))			
