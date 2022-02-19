set PATH=%PATH%;"E:\ProgramOther\node_binary\node-v16.13.0-win-x64"
rem pushd "E:\demo_projects\reactjs\test-chartjs"

del /Q /F .\src\local_ip_address.json
start cmd /k pm2 start src\server_dclocal.js 
:wait4file
timeout 5 /NOBREAK
if not exist .\src\local_ip_address.json goto wait4file
rem timeout 10
start cmd /k serve -s build 