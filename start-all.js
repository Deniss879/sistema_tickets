const { spawn } = require('child_process');
const http = require('http');

// Verificar si el servidor backend en puerto 3000 ya está activo
function checkServer(port, callback) {
  const req = http.get(`http://127.0.0.1:${port}/api/auth/login`, (res) => {
    callback(true);
  });
  req.on('error', () => {
    callback(false);
  });
  req.setTimeout(800, () => {
    req.abort();
    callback(false);
  });
}

function startBackend() {
  checkServer(3000, (isRunning) => {
    if (!isRunning) {
      console.log('\n🚀 [Auto-Server] Iniciando servidor backend PHP (puerto 3000) en segundo plano...');
      const php = spawn('C:\\xampp\\php\\php.exe', ['-S', '0.0.0.0:3000', 'server.php'], {
        detached: true,
        stdio: 'ignore',
        shell: false,
      });
      php.unref();
      console.log('✅ [Auto-Server] Servidor backend listo.');
    } else {
      console.log('✅ [Auto-Server] Servidor backend ya se encuentra activo en el puerto 3000.');
    }
  });
}

// Iniciar servidor PHP automático
startBackend();

// Pasar los argumentos a expo start
const isBun = typeof Bun !== 'undefined';
const runner = isBun ? 'bunx' : 'npx';
const args = process.argv.slice(2);
const expoArgs = args.length > 0 ? args : ['expo', 'start'];
const finalArgs = expoArgs[0] === 'expo' ? expoArgs : ['expo', ...expoArgs];

const child = spawn(runner, finalArgs, {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
