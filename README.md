# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte);

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
vercel dev
```

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
yarn build
```

## Deploying to Heroku

1. Login `heroku login`
2. Add a remote for client:
   `git remote add heroku-client https://git.heroku.com/big-button-mix.git`
3. Add a remote for api:
   `git remote add heroku-api`https://git.heroku.com/big-button-api.git`
