require('dotenv').config({ quiet: true });

const { spawn } = require('node:child_process');
const { createServer } = require('node:net');
const { setTimeout: esperar } = require('node:timers/promises');
const newman = require('newman');
const collection = require('./productos.postman_collection.json');

function puertoDisponible() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function ejecutar(folder, url) {
  return new Promise((resolve, reject) => {
    newman.run({
      collection, folder, envVar: [{ key: 'baseUrl', value: url }], reporters: ['cli'],
    }, (error, summary) => {
      if (error) return reject(error);
      if (summary.run.failures.length) return reject(new Error('Hay pruebas que revisar.'));
      return resolve();
    });
  });
}

function iniciar(port, dbPort) {
  return spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, PORT: String(port), DB_PORT: String(dbPort) },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

async function consultar(url) {
  try {
    return await fetch(url + '/api/productos', { signal: AbortSignal.timeout(1000) });
  } catch {
    return null;
  }
}

async function listo(url) {
  for (let intento = 0; intento < 20; intento++) {
    if (await consultar(url)) return;
    await esperar(200);
  }
  throw new Error('La API no inició. Revisa el puerto en el archivo .env.');
}

async function presentar() {
  const port = Number(process.env.PORT || 3010);
  const url = 'http://127.0.0.1:' + port;
  let api;
  let apiSinBase;
  try {
    if (!(await consultar(url))) {
      api = iniciar(port, process.env.DB_PORT || 3306);
      await listo(url);
    }

    if ((await consultar(url))?.status !== 200) {
      throw new Error('La API no puede listar productos. Inicia MySQL en XAMPP y revisa el archivo .env.');
    }
    console.log('\n1. CRUD Y VALIDACIÓN · API conectada a la base de datos\n');
    await ejecutar('CRUD y validación', url);

    const portPrueba = await puertoDisponible();
    const dbPortPrueba = await puertoDisponible();
    const urlPrueba = 'http://127.0.0.1:' + portPrueba;
    apiSinBase = iniciar(portPrueba, dbPortPrueba);
    await listo(urlPrueba);
    console.log('\n2. ERROR 500 · Instancia separada con la base de datos inaccesible\n');
    await ejecutar('Base de datos no disponible', urlPrueba);

    console.log('\nDemostración completa. 8 solicitudes y 27 verificaciones aprobadas.');
  } finally {
    apiSinBase?.kill();
    api?.kill();
  }
}

presentar().catch(error => {
  console.error('\n' + error.message);
  process.exitCode = 1;
});
