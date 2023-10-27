<h1 align="center">🌟 Express.ts Starter Template 🌟</h1>

## Setup locally

```bash
# clone this project
git clone https://github.com/kochan4php/express-ts-starter.git

# go to the project folder
cd express-ts-starter

# install pnpm if you does'nt have
npm i -g pnpm

# install dependencies
pnpm install

# create environment file and setup your environment variables for each files
pnpm create-env

# after setup your environment variables, launch docker database for development mode
pnpm docker:db:dev:up

# after that, run the project in local development mode
pnpm start:local:dev
```
