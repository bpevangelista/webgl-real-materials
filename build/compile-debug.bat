@echo off
setlocal enableextensions enabledelayedexpansion

pushd
call del build_debug_output.txt
call del ..\dist\efw.all.js
call del ..\dist\efw.min.js

REM Grab all files from the list
REM ------------------------------------------------------------------------------------------
set EFW_FILES=
for /F "tokens=*" %%A in (files-debug.txt) do set EFW_FILES=!EFW_FILES! %%A
set EFW_COPY_FILES=NUL
for /F "tokens=*" %%A in (files-debug.txt) do set EFW_COPY_FILES=!EFW_COPY_FILES! + %%A
set EFW_EXTERNS=
for /F "tokens=*" %%A in (externs.txt) do set EFW_EXTERNS=!EFW_EXTERNS! %%A

@echo on
REM call java -jar ..\closure\compiler.jar --warning_level=VERBOSE --js %EFW_FILES% --externs %EFW_EXTERNS% --js_output_file .\..\dist\efw.min.js 2>build_debug_output.txt

call copy /A /Y %EFW_COPY_FILES% .\..\dist\efw.all.js

@popd