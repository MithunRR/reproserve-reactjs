#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI escape codes for hyperlinks (OSC 8)
const createLink = (text, url) => {
  return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
};

// Get PM2 list as JSON
let pm2List;
try {
  const output = execSync('pm2 jlist', { encoding: 'utf-8' });
  pm2List = JSON.parse(output);
} catch (error) {
  console.error('Error getting PM2 list:', error.message);
  process.exit(1);
}

// Read ecosystem config to get port mappings
let portMap = {};
try {
  const ecosystemPath = path.join(__dirname, 'ecosystem.config.js');
  if (fs.existsSync(ecosystemPath)) {
    const ecosystem = require(ecosystemPath);
    ecosystem.apps.forEach(app => {
      if (app.env && app.env.PORT) {
        portMap[app.name] = app.env.PORT;
      }
    });
  }
} catch (error) {
  // Ignore if can't read ecosystem config
}

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'online': return colors.green;
    case 'stopped': return colors.red;
    case 'errored': return colors.red;
    case 'restarting': return colors.yellow;
    default: return colors.gray;
  }
};

// Format table
console.log('\n' + colors.bright + 'PM2 Process List with Links' + colors.reset + '\n');
console.log('─'.repeat(120));

// Header
console.log(
  colors.bright +
  `${'ID'.padEnd(4)} ${'Name'.padEnd(20)} ${'Status'.padEnd(12)} ${'Port'.padEnd(6)} ${'URL'.padEnd(30)} ${'CPU'.padEnd(8)} ${'Memory'.padEnd(10)}` +
  colors.reset
);
console.log('─'.repeat(120));

// Process each app
pm2List.forEach(app => {
  const id = String(app.pm_id || '').padEnd(4);
  const name = (app.name || '').padEnd(20);
  const status = (app.pm2_env?.status || 'unknown').padEnd(12);
  const statusColor = getStatusColor(app.pm2_env?.status);
  
  // Get port from ecosystem config or try to extract from logs/env
  let port = portMap[app.name] || 'N/A';
  let url = '';
  
  if (port !== 'N/A' && app.pm2_env?.status === 'online') {
    url = `http://localhost:${port}`;
  }
  
  const portStr = String(port).padEnd(6);
  
  // Create clickable URL link
  let urlDisplay;
  if (url && app.pm2_env?.status === 'online') {
    const linkText = url.padEnd(30);
    urlDisplay = createLink(linkText, url);
  } else {
    urlDisplay = (url ? url : 'N/A').padEnd(30);
  }
  
  const cpu = (app.monit?.cpu || 0).toFixed(1) + '%';
  const memory = app.monit?.memory 
    ? (app.monit.memory / 1024 / 1024).toFixed(1) + ' MB'
    : '0 MB';
  
  console.log(
    `${id} ${name} ${statusColor}${status}${colors.reset} ${portStr} ${urlDisplay} ${cpu.padEnd(8)} ${memory.padEnd(10)}`
  );
});

console.log('─'.repeat(120));
console.log(`\n${colors.gray}Tip: Click on the URLs above to open in your browser${colors.reset}\n`);

