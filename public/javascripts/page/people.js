var persons = 
[
	{
		name: "Николай Кучумов",
		summary: "управляющий",
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
	}
]

var people = new (new Class
({
	count: 3,
	index: 1,
	
	previous: function()
	{
		this.index--
		this.get_person()
	},
	
	next: function()
	{
		this.index++
		this.get_person()
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
			path: "images/page/people/button",
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
			path: "images/page/people/button",
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

var id_card_template

function initialize_page()
{
	initialize_arrows()
	
	dont_animate = true
	refresh_arrows()
	dont_animate = false
	
	$(function() 
	{
		template.load('templates/id card.html', function(template) 
		{
			template.apply(people.get_person()).inject_into('first_id_card_placeholder')
		})
	})
}
