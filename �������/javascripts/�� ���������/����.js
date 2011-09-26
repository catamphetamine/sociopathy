var persons = 
[
	{
		name: "Иван Петров",
		summary: "раз два три",
		gender: "male",
		origin: "Москва"
	},
	{
		name: "Two",
		summary: "second",
		gender: "female",
		origin: "Moscow"
	},
	{
		name: "Three",
		summary: "third",
		gender: "male",
		origin: "Baghdad"
	},
	{
		name: "Two",
		summary: "second",
		gender: "female",
		origin: "Moscow"
	},
	{
		name: "Three",
		summary: "third",
		gender: "male",
		origin: "Baghdad"
	},
	{
		name: "Two",
		summary: "second",
		gender: "female",
		origin: "Moscow"
	},
	{
		name: "Three",
		summary: "third",
		gender: "male",
		origin: "Baghdad"
	},
	{
		name: "Two",
		summary: "second",
		gender: "female",
		origin: "Moscow"
	},
	{
		name: "Three",
		summary: "third",
		gender: "male",
		origin: "Baghdad"
	}
]

var people = new (new Class
({
	count: persons.length,
	index: 1,
	
	previous: function()
	{
		var person = this.get_person()
		this.index--
		return person
	},
	
	next: function()
	{
		var person = this.get_person()
		this.index++
		return person
	},
	
	get_person: function()
	{
		return persons[this.index - 1]
	},
	
	has_next: function()
	{
		return this.index < this.count
	},
	
	has_previous: function()
	{
		return this.index > 0
	}
}))

/*
var previous_arrow
var next_arrow

var dont_animate = false

// activate arrows
function initialize_arrows()
{
	// previous
	previous_arrow = new image_button
	(
		"previous_person_button", 
		{
			path: "картинки/на страницах/people/button",
			"button name": "previous",
			width: 64,
			height: 64,
			action: function() { people.previous() }
		}
	)
	
	// next
	next_arrow = new image_button
	(
		"next_person_button", 
		{
			path: "картинки/на страницах/people/button",
			"button name": "next",
			width: 64,
			height: 64,
			action: function() { people.next() }
		}
	)
}

function refresh_arrows()
{
	// previous
	if (people.has_previous())
	{
		if (!dont_animate)
			previous_arrow.show()
		else
			previous_arrow.show_animated()
	}
	else
	{
		if (!dont_animate)
			previous_arrow.hide()
		else
			previous_arrow.hide_animated()
	}
	
	// next
	if (people.has_next())
	{
		if (!dont_animate)
			next_arrow.show()
		else
			next_arrow.show_animated()
	}
	else
	{
		if (!dont_animate)
			next_arrow.hide()
		else
			next_arrow.hide_animated()
	}
}
*/

var $content
var $id_cards
var id_card_template

function add_id_card(person)
{
	var id_card = $.tmpl('id card', person)
	var wrapper = $('<li/>')
	wrapper.append(id_card).appendTo($id_cards)
}

function initialize_page()
{
//	initialize_arrows()
	
//	dont_animate = true
//	refresh_arrows()
//	dont_animate = false
	
	$content = $('#content')
	$id_cards = $('#id_cards')

	$.ajax
	({
		cache: false,
		url: 'лекала/личная карточка.html',
		dataType: 'html'
	}).
	success(function (template) 
	{
		id_card_template = $.template('id card', template)
		
		add_id_card(people.next())
		add_id_card(people.next())
		add_id_card(people.next())
		add_id_card(people.next())

		activate_id_card_loader()
	}).
	error(function () 
	{
		alert('error loading id card template')
	})

/*		
	template.load('templates/личная карточка.html', function(template) 
	{
		id_card_template = template
		
		//template.apply(people.get_person()).inject_into('id_card_placeholder')
		add_id_card(people.next())
		add_id_card(people.next())

		activate_id_card_loader()
	})
*/
}

function activate_id_card_loader()
{
	$(function()
	{
		var $loading = $("#people_loading")
		//$loading.hide()
		var $footer = $('footer')

		var options = 
		{
			offset: '100%'
		}
		
		$footer.waypoint(function(event, direction)
		{
			$footer.waypoint('remove')
			//$id_cards.after($loading)
			$loading.show()

			//
			
			var person = people.next();
			
			if (typeof(person) === "undefined")
			{
				//$loading.detach()
				$footer.waypoint('remove')
				$loading.hide()
				return
			}
				
			add_id_card(person)
			//$loading.detach()
			$loading.hide()
			
			$footer.waypoint(options)
					
			/*
			$.get
			(
				url: '/people/', 
				data: { after: after_person_id },
				success: function(data)
				{
					alert(data)
					$id_cards.append(format_people(data))
					$loading.detach()
					
					$footer.waypoint(options)
				},
				dataType: 'json'
			)
			*/
		}, options)
	})
}