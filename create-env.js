/**
 * @description This script will create some .env files in the env folder based on the .env.example file in the root project.
 * @author {Deo Sbrn}
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');

const envExample = fs.readFileSync('./env/.env.example', 'utf8');
const environments = ['local', 'staging', 'production', 'production.local'];

environments.forEach((environment) => {
    if (!fs.existsSync(`./env`)) fs.mkdirSync(`./env`);
    fs.writeFileSync(`./env/.env.${environment}`, envExample);
    console.log(`.env.${environment} file created successfully!`);
});
