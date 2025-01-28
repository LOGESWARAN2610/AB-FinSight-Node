const Service = require('node-windows').Service;

const svc = new Service({
  name: 'FinSight',
  script: 'G:\\AB-FinSight-Node\\server.js',
});

svc.on('uninstall', () => {
  console.log('Service uninstalled successfully!');
});

svc.uninstall();
