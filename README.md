Sociopathy

   a social network

   социальная сеть

Can I see a demo?
=============

Yes, you can view it here: http://youtu.be/cmpTj1Tmfv8

What's different?
=============

It's a social network with a built-in wikipedia, so it suits perfectly for groups of people who want to communicate and share some knowledge.

It has a good old chat.

It has a good old forum.

It has good old blogs (scheduled for future releases).


It retains all the good old things from good old web 1.0 uniting them all under the hood of web 2.0 social features.


It's not your facebook at all.

Is it multilanguage?
=============

Yes, everything is translateable into any language.

The built-in languages are English and Russian.


See the "static resources/international" folder for general translation.

Every plug-in has its own translation located in "static resources/plugins/[Plugin name]/translation" folder.

URLs are translateable too.


Is it modular?
=============

Yes, every major piece of functionality is loaded as a plug-in.

You can choose the plug-ins you want in the "Plugins" property of your "configuration.coffee" file.


Is it skinnable?
=============

Yes, it is.

You can create your own theme if you like.


(the documentation on how to apply your own skin will be available in a future release)

What platforms does it run on?
=============

It runs on any platform, be it Windows, Linux or Mac

How can I install it on my Ubuntu Linux machine?
=============

Download the interactive installation script: 'automation/install.sh'.

Run it as root.

It will download this repository to your machine and will set it up.


A better installer will be available in future releases.


What technology stack is used?
=============

Html 5

Css 3 (Less)

Javascript (jQuery, jQuery Templates, Mootools, Node.js (+ Express, node-fibers, socket.io), WebSocket)

MongoDB

NginX

Redis

// Memcache (currently no need for caching)

ImageMagick

// in future releases: Scala (Scalatra, Jetty, Gradle)

Is it free?
=============

Yes it is.

This software is distributed under the terms of "GNU General Public License" whatever it means.


Contributing
=============

To push updated code to this git repository correctly on Windows you need to use Utf-8 version of Git for Windows:

http://code.google.com/p/utf8-git-on-windows/
