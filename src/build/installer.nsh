!macro customCheckAppRunning
  nsExec::Exec `"$SYSDIR\taskkill.exe" /F /T /IM "Requiem.exe"`
  Sleep 3000
  nsExec::Exec `"$SYSDIR\taskkill.exe" /F /T /IM "Requiem.exe"`
  Sleep 2000
!macroend

!macro customInit
  nsExec::Exec `"$SYSDIR\taskkill.exe" /F /T /IM "Requiem.exe"`
  Sleep 2000
!macroend
