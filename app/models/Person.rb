class Person
	include MongoMapper::Document
	
	key :name, String, :required => true
	key :sex, String
	key :origin, String
	
	key :joined_on, Time, :required => true
	
	validates_uniqueness_of :name
end 

=begin

person = Person.create
({
	:name => 'John',
	:sex => 'male',
	:origin => 'Alaska',
	:joined_on => Time.now
})

person.save

=end