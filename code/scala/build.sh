javac -d classes sources/javanese/*.java
scalac -classpath "libraries/jersey-core-1.12.jar:libraries/grizzly-framework-2.1.9.jar:libraries/jersey-bundle-1.12.jar:libraries/grizzly-http-server-2.1.9.jar:libraries/grizzly-comet-webserver-1.9.45.jar:classes" -d classes sources/*.scala sources/**/*.scala
