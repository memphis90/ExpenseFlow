Set oShell = CreateObject("WScript.Shell")
oShell.CurrentDirectory = "C:\Users\il_me\Downloads\spese-app-v4\spese-app"
oShell.Run "cmd /c avvia-app.bat", 1, False
