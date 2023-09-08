/**
 * @description This script will create some .env files in the env folder based on the .env.example file in the root project.
 * @author {Deo Sbrn}
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { existsSync, mkdirSync, readFileSync } = require('fs');
const { writeFile } = require('fs/promises');
const clc = require('cli-color');

const envExample = readFileSync('./env/.env.example', 'utf8');
const environments = ['local', 'staging', 'production', 'production.local'];

environments.forEach(async (environment) => {
    if (!existsSync('./env-test')) mkdirSync('./env-test');

    try {
        await writeFile(`./env-test/.env.${environment}`, envExample);
        console.log(clc.green(`.env.${environment} file created successfully! ✅`));
    } catch (err) {
        console.log(clc.red('Something went wrong. ❌'));
        console.log(clc.cyan('Please contact the owner of this template! ❕'));
        process.exit(1);
    }
});
