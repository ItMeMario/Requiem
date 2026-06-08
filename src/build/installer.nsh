!macro customInit
  nsExec::Exec `taskkill /F /T /IM Requiem.exe`
  nsExec::Exec `powershell -NoProfile -WindowStyle Hidden -Command "Get-Process | Where-Object { $$_.Path -like '$INSTDIR\*' } | Stop-Process -Force"`
!macroend

!macro customCheckAppRunning
  nsExec::Exec `taskkill /F /T /IM Requiem.exe`
  nsExec::Exec `powershell -NoProfile -WindowStyle Hidden -Command "Get-Process | Where-Object { $$_.Path -like '$INSTDIR\*' } | Stop-Process -Force"`
  Sleep 2000
!macroend
