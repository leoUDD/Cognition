#!/usr/bin/env bash
# Instalador del ejecutor de Cognition para WSL (Ubuntu).
# Uso (lo muestra la página con tu dirección):
#   curl -fsSL https://TU-APP.vercel.app/runner/instalar.sh | bash -s -- https://TU-APP.vercel.app
# Qué hace:
#   1. Instala gcc y python3 si faltan (pide tu contraseña de Linux).
#   2. Descarga el ejecutor en ~/.cognition/.
#   3. Registra el enlace cognition:// en Windows: la página lo usa para iniciar el ejecutor
#      (oculto) cuando lo necesitas. El ejecutor se apaga solo al cerrar la página.
#   No se inicia con Windows ni queda nada corriendo en segundo plano.
# Para desinstalar: ~/.cognition/desinstalar.sh
set -eo pipefail
ORIGEN="${1%/}"
if [ -z "$ORIGEN" ]; then echo "Falta la dirección del sitio. Copia el comando completo desde la página de Cognition."; exit 1; fi
DIR="$HOME/.cognition"
PUERTO=7777
AUTO=120
paso() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
mkdir -p "$DIR"

paso "1/3 Revisando gcc y python3"
faltan=()
command -v gcc >/dev/null 2>&1 || faltan+=(gcc)
command -v python3 >/dev/null 2>&1 || faltan+=(python3)
if [ ${#faltan[@]} -gt 0 ]; then
  echo "Instalando: ${faltan[*]} (si te pide contraseña, es la de tu usuario de Linux; no se ve al escribir)"
  sudo apt-get update -qq && sudo apt-get install -y -qq "${faltan[@]}"
fi
echo "gcc: $(gcc --version | head -1)"

paso "2/3 Descargando el ejecutor"
curl -fsSL "$ORIGEN/runner/cognition_runner.py" -o "$DIR/cognition_runner.py"
python3 -m py_compile "$DIR/cognition_runner.py"
echo "Guardado en $DIR/cognition_runner.py"

# Lanzador: se actualiza desde el sitio y arranca con cierre automático
cat > "$DIR/iniciar.sh" <<EOS
#!/usr/bin/env bash
# Inicia el ejecutor de Cognition. Lo llama el enlace cognition:// (desde la página) o el comando "cognition".
cd "\$HOME/.cognition" || exit 1
if curl -fsSL --max-time 5 "$ORIGEN/runner/cognition_runner.py" -o cognition_runner.py.nuevo 2>/dev/null \\
   && python3 -m py_compile cognition_runner.py.nuevo 2>/dev/null; then
  mv cognition_runner.py.nuevo cognition_runner.py
else
  rm -f cognition_runner.py.nuevo
fi
exec python3 cognition_runner.py --origen "$ORIGEN" --puerto $PUERTO --auto-cerrar $AUTO "\$@"
EOS
chmod +x "$DIR/iniciar.sh"
if ! grep -q "alias cognition=" "$HOME/.bashrc" 2>/dev/null; then
  echo "alias cognition='\$HOME/.cognition/iniciar.sh'" >> "$HOME/.bashrc"
fi

paso "3/3 Registrando el enlace cognition:// en Windows"
pkill -f cognition_runner.py 2>/dev/null || true
WIN=""
if command -v wslpath >/dev/null 2>&1 && [ -x /mnt/c/Windows/System32/cmd.exe ]; then
  wincmd() { (cd /mnt/c && /mnt/c/Windows/System32/cmd.exe /c "$1" 2>/dev/null | tr -d '\r'); }
  APPDATA_WIN=$(wincmd "echo %APPDATA%"); LOCAL_WIN=$(wincmd "echo %LOCALAPPDATA%")
  # Quitar el inicio automático de una versión anterior del instalador
  rm -f "$(wslpath "$APPDATA_WIN")/Microsoft/Windows/Start Menu/Programs/Startup/Cognition-ejecutor.vbs" 2>/dev/null || true
  CARPETA="$(wslpath "$LOCAL_WIN")/Cognition"
  mkdir -p "$CARPETA"
  DISTRO="${WSL_DISTRO_NAME:-Ubuntu}"
  # Lanzador oculto (ventana 0). En VBScript las comillas dobles se escriben "".
  printf '%s\r\n' "' Inicia el ejecutor de Cognition dentro de WSL (lo abre el enlace cognition://)." \
    "CreateObject(\"WScript.Shell\").Run \"wsl.exe -d $DISTRO -- bash -lc \"\"~/.cognition/iniciar.sh >> ~/.cognition/ejecutor.log 2>&1\"\"\", 0, False" > "$CARPETA/iniciar.vbs"
  VBS_WIN="$LOCAL_WIN\\Cognition\\iniciar.vbs"
  VBS_REG=$(printf '%s' "$VBS_WIN" | sed 's/\\/\\\\/g')
  printf '%s\r\n' 'REGEDIT4' '' \
    '[HKEY_CURRENT_USER\Software\Classes\cognition]' '@="URL:Cognition"' '"URL Protocol"=""' '' \
    '[HKEY_CURRENT_USER\Software\Classes\cognition\shell\open\command]' "@=\"wscript.exe \\\"$VBS_REG\\\"\"" > "$CARPETA/cognition.reg"
  if (cd /mnt/c && /mnt/c/Windows/System32/reg.exe import "$(wslpath -w "$CARPETA/cognition.reg")" >/dev/null 2>&1); then
    WIN="$CARPETA"; echo "Enlace registrado. Lanzador: $VBS_WIN"
  else
    echo "⚠ No pude registrar el enlace en Windows."
  fi
fi
cat > "$DIR/desinstalar.sh" <<EOS
#!/usr/bin/env bash
pkill -f cognition_runner.py 2>/dev/null || true
if [ -x /mnt/c/Windows/System32/reg.exe ]; then (cd /mnt/c && /mnt/c/Windows/System32/reg.exe delete 'HKCU\\Software\\Classes\\cognition' /f >/dev/null 2>&1) || true; fi
[ -n "$WIN" ] && rm -rf "$WIN"
sed -i "/alias cognition=/d" "\$HOME/.bashrc"
rm -rf "\$HOME/.cognition"
echo "Ejecutor de Cognition desinstalado."
EOS
chmod +x "$DIR/desinstalar.sh"

printf '\n\033[1;32m✔ Listo.\033[0m\n'
if [ -n "$WIN" ]; then
  echo "  Vuelve a la página y presiona \"Iniciar compilador\". La primera vez, Chrome preguntará si abrir Cognition:"
  echo "  marca \"Permitir siempre\" y acepta. El ejecutor se apaga solo cuando cierras la página."
else
  echo "  No estás en WSL con Windows: inicia el ejecutor a mano con: ~/.cognition/iniciar.sh"
fi
echo "  Registro: ~/.cognition/ejecutor.log · Desinstalar: ~/.cognition/desinstalar.sh"
