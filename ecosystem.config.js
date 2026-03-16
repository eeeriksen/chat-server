module.exports = {
  apps: [
    {
      name: 'chat-server',
      script: 'index.js',
      env_production: {
        NODE_ENV: 'production'
      },
      env_development: {
        NODE_ENV: 'development'
      },
      // This passes the native Node.js flag to PM2
      node_args: process.env.NODE_ENV === 'production' 
        ? '--env-file=.env.production' 
        : '--env-file=.env.development'
    }
  ]
}
