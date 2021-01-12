# svelte webportfolio

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

_Note that you will need to have [Node.js](https://nodejs.org) installed. For production mode you also need docker and docker-compose installed and setup_

---

Additionally, I added scss and sass support [sveltePreprocess](https://github.com/sveltejs/svelte-preprocess). Further it is compiling the code with babel in production mode.

### Built With

Inititally the app is built with svelte and gets served from a node server. I deployed it on heroku with cloudflare security and performance.

- [Svelte](https://svelte.dev/)
- [Nodejs](https://nodejs.org)
- [Heroku](https://dashboard.heroku.com/)
- [Cloudflare](https://www.cloudflare.com/)

## Get started

### Development

Install the dependencies...

```bash
cd webportfolio
npm install
```

either start with

- Svelte

  ...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

or start with

- docker

```bash
docker-compose build
docker-compose up
```

Now the app gets served via a node server.

Navigate to [localhost:3000](http://localhost:3000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

---

If you're using [Visual Studio Code](https://code.visualstudio.com/) we recommend installing the official extension [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode). If you are using other editors you may need to install a plugin in order to get syntax highlighting and intellisense.

## Building and running in production mode

To create an optimised version of the app:

```bash
    docker-compose -f docker-compose.yml build
```

You can run the newly built app with `docker-compose -f docker-compose.yml up`. Navigate to [localhost:3000](http://localhost:3000). This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).

## Deploying to heroku

Make sure to have [Heroku Cli](https://devcenter.heroku.com/articles/heroku-cli) downloaded and installed on your machine

### Login to Heroku

```bash
    heroku login
    heroku container:login
```

Either create an app on heroku with `heroku create` or deploy to an existing app `heroku git:remote -a your_app_name`.

You can get the app name with `heroku apps`.

### Deploy on intel based machine

First tag your production docker image (webapp:prod) which you build before:

```bash
docker tag webapp:prod registry.heroku.com/your_heroku_app/web
```

...then push it to heroku.registry

```bash
docker push registry.heroku.com/your_heroku_app/web
```

and finally release it with

```bash
    heroku container:release web
```

### Deploy with ARM based machine (Apple M1)

_Because the new Apple M1 Chip is based on ARM-Architecture, but Heroku Dynos are Intel based, your Docker image needs to support x86 architecture to be runnable on Heroku. This is possible with the experimental docker function [buildx](https://docs.docker.com/docker-for-mac/multi-arch/)_

Run `docker buildx create --name mybuilder --use` to create a new builder and switch to it using a single command.

Next, build the production image with docker buildx and linux/amd64 support and push it to heroku.registry

```bash
docker buildx build --platform linux/amd64 --target prod -t registry.heroku.com/your_heroku_app/web  --push .
```

> - The --platform flag informs buildx to generate Linux images for AMD 64-bit architectures.
> - The --push flag generates a multi-arch manifest and pushes the image to Heroku Registry.
> - the --target flag specifies the target build stage

Finally release your app

```bash
    heroku container:release web
```
