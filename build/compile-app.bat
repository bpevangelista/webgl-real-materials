@setlocal enableextensions enabledelayedexpansion

call compile-release.bat

call java -jar .\..\closure\compiler.jar --jscomp_off=externsValidation --js ..\application.js --externs ..\dist\efw.min.js --js_output_file .\..\dist\app.min.js 2>build_application_output.txt

copy ..\application.js .\..\dist\app.all.js