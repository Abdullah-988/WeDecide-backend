<h1 align="center">📊 WeDecide Backend</h1>

Real time poll voting backend app built using PostgreSQL, Express.js, Pusher and Node.js with Typescript.

feel free to check this project's [front-end](https://github.com/Ako-Mawlood/WeDecide-frontend)

## Getting started

To get started with this project, run:

```bash
git clone https://github.com/Abdullah-988/WeDecide-backend.git
```

Setup `.env` file:

```
DATABASE_URL=""
PORT=
JWT_SECRET=""

PUSHER_APP_ID=""
NEXT_PUBLIC_PUSHER_APP_KEY=""
PUSHER_APP_SECRET=""
```

to generate a quick JWT secret use can run:

```bash
openssl rand -base64 32
```

then run:

```bash
npm install
```

and

```bash
npm run dev
```

## License

WeDecide is released under the [MIT License](https://opensource.org/licenses/MIT).
