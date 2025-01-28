const Service = require('node-windows').Service;

const svc = new Service({
  name: 'FinSight', 
  description: 'AB FinSight Application running as a Windows Service.',
  script: 'G:\\AB-FinSight-Node\\server.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    }
  ]
});

svc.on('install', () => {
  console.log('Service installed successfully!');
  svc.start();
});

svc.install();
