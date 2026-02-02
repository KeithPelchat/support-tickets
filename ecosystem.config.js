module.exports = {
  apps: [
    {
      name: 'support-tickets',
      script: 'npm',
      args: 'start',
      cwd: '/home/ec2-user/projects/support-tickets',
      env: {
        NODE_ENV: 'production',
        PORT: 3900,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
  ],
};
