This is the official web client for [Procedural Realms](https://proceduralrealms.com), an online MUD/text-based MMORPG. The client can be accessed directly at https://play.proceduralrealms.com.

# Environment Setup
1. Install the latest version of [Node.JS](https://nodejs.org/) (LTS)
2. Clone this repository, change to the directory, and run:

```
npm install
```

3. Set the development environment configuration to point to the production system:

```
cp .env.production .env.development
```

4. Start the server:

```
npm run serve
```

5. The web client should be up and running at http://localhost:8080


# Build for Production
```
npm run build
```

# Resources
The web client is built using Vue 3 and Naive UI:

- [Vue.JS](https://vuejs.org/)
- [Naive UI](https://www.naiveui.com/)
