@echo off
setlocal enableextensions enabledelayedexpansion

call del build_release_output.txt

pushd
call del ..\\efw.all.js
call del ..\\efw.min.js

REM Grab all files from the list
REM ------------------------------------------------------------------------------------------
set EFW_FILES=
for /F "tokens=*" %%A in (files-release.txt) do set EFW_FILES=!EFW_FILES! %%A
set EFW_COPY_FILES=NUL
for /F "tokens=*" %%A in (files-release.txt) do set EFW_COPY_FILES=!EFW_COPY_FILES! + %%A
set EFW_EXTERNS=
for /F "tokens=*" %%A in (externs.txt) do set EFW_EXTERNS=!EFW_EXTERNS! %%A

@echo on
call java -jar .\..\closure\compiler.jar --warning_level=VERBOSE --js %EFW_FILES% --externs %EFW_EXTERNS% --js_output_file efw.min.js 2>build_release_output.txt

call copy /A /Y %EFW_COPY_FILES% efw.all.js

@popd