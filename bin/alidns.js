#!/usr/bin/env node

const build = require('../package.json')
const service = require('../service.js');

function showUsage() {
    console.log('Usage:');
    console.log('   alidns [options]');
    console.log();
    console.log('Available options:');
    console.log();
    console.log('  -h, --host      your domain, for example: ssh.example.com .');
    console.log('  --type          record type, default: A. Read more: https://en.wikipedia.org/wiki/List_of_DNS_record_types ');
    console.log('  --ip            ip address, IP corresponding to the domain name .');
    console.log('  -v, --version  Shows program version');
    console.log();
    process.exit(1);
}

if (process.argv.length <= 2) {
    showUsage();
}

let target = { hostname: "", type: "A", ip: "" };
let args = process.argv.splice(2);

for (let i = 0; i < args.length; i++) {
    let entry = args[i];
    if (entry === '-h' || entry === '--help') {
        showUsage();
    } else if (entry === '-v' || entry === '--version') {
        console.log('alidns ', build.version, ')');
        console.log();
        process.exit(0);
    } else if (entry === '-h' || entry === '--host' || entry === '--hostname') {
        target.hostname = args[i + 1];
    } else if (entry === '--type') {
        target.type = args[i + 1];
    } else if (entry === '--ip') {
        target.ip = args[i + 1];
    }
}

service.updateRecord(target, (msg) => {
    console.log(new Date() + ': [' + msg + '] ' + JSON.stringify(target));
    if (msg === 'error') {
        console.error(msg);
    } else {
        console.log(msg);
    }
});