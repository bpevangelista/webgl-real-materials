@echo off
setlocal enableextensions enabledelayedexpansion

call del .\..\dist\app.all.js
call del .\..\dist\app.min.js

call compile-debug.bat
call compile-release.bat

@echo on
call java -jar .\..\closure\compiler.jar --jscomp_off=externsValidation --js ..\application.js --externs ..\dist\efw.min.js --js_output_file .\..\dist\app.min-nolicense.js 2>build_application_output.txt

@REM copy /b /y ..\license.txt + ..\application.js ..\dist\app.all.js
copy /b /y ..\application.js ..\dist\app.all.js
copy /b /y ..\license.txt + ..\dist\app.min-nolicense.js ..\dist\app.min.js
del /q ..\dist\app.min-nolicense.js