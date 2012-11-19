@setlocal enableextensions enabledelayedexpansion

call java -jar .\closure\compiler.jar  --jscomp_off=checkVars --js application.js --externs efw.min.js --js_output_file app.min.js 2>build_release_output.txt
