set PATH=%PATH%;"E:\ProgramOther\node_binary\node-v16.13.0-win-x64"
rem pushd "E:\demo_projects\reactjs\test-chartjs"

start cmd /k pm2 start src\server_dclocal.js 
tmeout 10
start cmd /k serve -s build 