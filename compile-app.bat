@setlocal enableextensions enabledelayedexpansion

call java -jar .\closure\compiler.jar  --jscomp_off=checkVars --js application.js --externs dist\efw.min.js --js_output_file .\dist\app.min.js 2>.\dist\build_application_output.txt
