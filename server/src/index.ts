import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__, COOKIE_NAME } from "./constants";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import cors from 'cors';

const RedisStore = connectRedis(session);
const redisClient = redis.createClient();


const main = async () => {
    // connect to database
    const orm = await MikroORM.init(mikroConfig);
    // run migrations when sever starts. (creates table if not run)
    await orm.getMigrator().up();

    const app = express();
    app.use(cors({
        origin: "http://localhost:3000",
        credentials: true
    }));
    app.use(
        session({
          name: COOKIE_NAME,
          store: new RedisStore({ 
              client: redisClient,
              disableTTL: true
          }),
          cookie: {
              maxAge: 1000 * 60 * 60 * 24 * 356 * 10,
              httpOnly: true,
              sameSite: 'lax', //csrf
              secure: __prod__ // set to true on prod. only sets on https
          },
          secret: 'sdfahsldfasjkdnfasidfnajsldkfa',
          resave: false,
          saveUninitialized: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}): MyContext => ({ em: orm.em, req, res })
    });

    apolloServer.applyMiddleware({ app, cors: false })

    app.get('/', (_, res) => {
        res.send('hello world');
    });
    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
    
}

main();