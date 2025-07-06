!macro customInstall
  ; Kill any running instances of the app
  nsExec::ExecToLog 'taskkill /F /IM "qr-billing-desktop.exe"'
!macroend
