module.exports = {
  apps: [
    {
      name: 'reposerve-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/creativecrows-reproserve/htdocs/reproserve.creativecrows.com',
      env: {
        NODE_ENV: 'development',
        PORT: 3003
      },
      watch: true,
      ignore_watch: ['node_modules', 'build', '.git'],
      instances: 1,
      exec_mode: 'fork'
    },
    {
      name: 'reposerve-prod',
      script: 'server.js',
      cwd: '/home/creativecrows-reproserve/htdocs/reproserve.creativecrows.com',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false
    }
  ]
};
