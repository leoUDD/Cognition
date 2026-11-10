#!/usr/bin/env bash
# Instalador del ejecutor de Cognition para WSL (Ubuntu).
# Uso (lo muestra la página con tu dirección):
#   curl -fsSL https://TU-APP.vercel.app/runner/instalar.sh | bash -s -- https://TU-APP.vercel.app
# Qué hace:
#   1. Instala gcc y python3 si faltan (pide tu contraseña de Linux).
#   2. Descarga el ejecutor en ~/.cognition/.
#   3. Crea el comando "cognition" para iniciarlo a mano.
#   4. Lo configura para que arranque solo y oculto al iniciar Windows, y lo inicia ahora.
# Para desinstalar: ~/.cognition/desinstalar.sh
set -eo pipefail
ORIGEN="${1%/}"
if [ -z "$ORIGEN" ]; then echo "Falta la dirección del sitio. Copia el comando completo desde la página de Cognition."; exit 1; fi
DIR="$HOME/.cognition"
PUERTO=7777
paso() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
mkdir -p "$DIR"

paso "1/4 Revisando gcc y python3"
faltan=()
command -v gcc >/dev/null 2>&1 || faltan+=(gcc)
command -v python3 >/dev/null 2>&1 || faltan+=(python3)
if [ ${#faltan[@]} -gt 0 ]; then
  echo "Instalando: ${faltan[*]} (si te pide contraseña, es la de tu usuario de Linux; no se ve al escribir)"
  sudo apt-get update -qq && sudo apt-get install -y -qq "${faltan[@]}"
fi
echo "gcc: $(gcc --version | head -1)"

paso "2/4 Descargando el ejecutor"
curl -fsSL "$ORIGEN/runner/cognition_runner.py" -o "$DIR/cognition_runner.py"
python3 -m py_compile "$DIR/cognition_runner.py"
echo "Guardado en $DIR/cognition_runner.py"

# Lanzador: se actualiza desde el sitio al arrancar y luego inicia el ejecutor
cat > "$DIR/iniciar.sh" <<EOS
#!/usr/bin/env bash
# Inicia el ejecutor de Cognition (lo usan el comando "cognition" y el inicio automático de Windows)
cd "\$HOME/.cognition" || exit 1
if curl -fsSL --max-time 8 "$ORIGEN/runner/cognition_runner.py" -o cognition_runner.py.nuevo 2>/dev/null \\
   && python3 -m py_compile cognition_runner.py.nuevo 2>/dev/null; then
  mv cognition_runner.py.nuevo cognition_runner.py
else
  rm -f cognition_runner.py.nuevo
fi
exec python3 cognition_runner.py --origen "$ORIGEN" --puerto $PUERTO "\$@"
EOS
chmod +x "$DIR/iniciar.sh"

paso "3/4 Creando el comando 'cognition'"
if ! grep -q "alias cognition=" "$HOME/.bashrc" 2>/dev/null; then
  echo "alias cognition='\$HOME/.cognition/iniciar.sh'" >> "$HOME/.bashrc"
fi
echo "Desde una terminal nueva puedes escribir: cognition"

paso "4/4 Inicio automático con Windows"
VBS=""
if command -v wslpath >/dev/null 2>&1 && [ -x /mnt/c/Windows/System32/cmd.exe ]; then
  APPDATA_WIN=$(cd /mnt/c && /mnt/c/Windows/System32/cmd.exe /c "echo %APPDATA%" 2>/dev/null | tr -d '\r')
  STARTUP="$(wslpath "$APPDATA_WIN")/Microsoft/Windows/Start Menu/Programs/Startup"
  if [ -d "$STARTUP" ]; then
    DISTRO="${WSL_DISTRO_NAME:-Ubuntu}"
    VBS="$STARTUP/Cognition-ejecutor.vbs"
    # Ventana oculta (0) y sin esperar (False). En VBScript las comillas dobles se escriben "".
    printf '%s\r\n' "' Inicia el ejecutor de Cognition dentro de WSL al iniciar sesion. Para quitarlo, borra este archivo." \
      "CreateObject(\"WScript.Shell\").Run \"wsl.exe -d $DISTRO -- bash -lc \"\"~/.cognition/iniciar.sh >> ~/.cognition/ejecutor.log 2>&1\"\"\", 0, False" > "$VBS"
    echo "Creado: $VBS"
  fi
fi
cat > "$DIR/desinstalar.sh" <<EOS
#!/usr/bin/env bash
pkill -f cognition_runner.py 2>/dev/null || true
[ -n "$VBS" ] && rm -f "$VBS"
sed -i "/alias cognition=/d" "\$HOME/.bashrc"
rm -rf "\$HOME/.cognition"
echo "Ejecutor de Cognition desinstalado."
EOS
chmod +x "$DIR/desinstalar.sh"

# Iniciar ahora (reemplaza uno anterior si estaba corriendo)
pkill -f cognition_runner.py 2>/dev/null || true
sleep 0.5
if [ -n "$VBS" ]; then
  (cd /mnt/c && /mnt/c/Windows/System32/wscript.exe "$(wslpath -w "$VBS")") || true
else
  echo "(No encontré la carpeta de Inicio de Windows: el ejecutor no arrancará solo. Inícialo con: cognition)"
  nohup "$DIR/iniciar.sh" >> "$DIR/ejecutor.log" 2>&1 &
fi
for i in $(seq 1 30); do
  if curl -fs --max-time 1 -H "Origin: $ORIGEN" "http://127.0.0.1:$PUERTO/salud" >/dev/null 2>&1; then
    printf '\n\033[1;32m✔ Listo. El ejecutor está corriendo en http://127.0.0.1:%s\033[0m\n' "$PUERTO"
    echo "  Vuelve a la página y presiona \"Reintentar\"."
    [ -n "$VBS" ] && echo "  Desde ahora se inicia solo cada vez que entras a Windows (no necesitas dejar ninguna ventana abierta)."
    echo "  Registro: ~/.cognition/ejecutor.log · Desinstalar: ~/.cognition/desinstalar.sh"
    exit 0
  fi
  sleep 0.5
done
echo "⚠ El ejecutor no respondió. Revisa ~/.cognition/ejecutor.log o inícialo a mano con: ~/.cognition/iniciar.sh"
exit 1
