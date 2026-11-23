@echo off
title Servidor Backend - Sistema de Tickets (Puerto 3000)
color 0B
echo =======================================================
echo   INICIANDO SERVIDOR BACKEND (PUERTO 3000)
echo   Sistema de Tickets - Tezontepec de Aldama
echo =======================================================
echo.

echo [1/2] Verificando MySQL en XAMPP...
if exist "C:\xampp\mysql_start.bat" (
    start /min "" "C:\xampp\mysql_start.bat"
)

echo [2/2] Levantando API en el puerto 3000...
echo.
echo =======================================================
echo  SERVIDOR ACTIVO EN: http://192.168.1.113:3000
echo.
echo  YA PUEDES INICIAR SESION EN TU TELEFONO:
echo    - Usuario: samantha  ^| Contrasena: 123
echo.
echo  * IMPORTANTE: No cierres esta ventana mientras uses la app *
echo =======================================================
echo.

"C:\xampp\php\php.exe" -S 0.0.0.0:3000 server.php
pause
