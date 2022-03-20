@echo off
::Get formatted timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"


::Set image name
set image=jungledome1905/minearmycore
  
::Set timestamp for the tag  
set timestamp=%YYYY%%MM%%DD%

::Set image tags value
set tag=%image%:%timestamp%
set latest=%image%:latest

@echo on
  
::Build image with tags
docker build -t %tag% -t %latest% .
  
::Login to docker
docker login  

::Push image to dockerhub  
docker push %image%

::Remove dangling images (use this carefully if you have other images)
::docker system prune -f  

pause