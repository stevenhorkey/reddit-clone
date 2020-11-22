import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
    // connect to database
    const orm = await MikroORM.init(mikroConfig);
    // run migrations. (create table)
    await orm.getMigrator().up();

    // create and insert 'post'
    // const post = orm.em.create(Post, {title: "my first post"});
    // await orm.em.persistAndFlush(post);

    // get all posts
    // const posts = await orm.em.find(Post, {});
    // console.log(posts);

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({ em: orm.em })
    });

    apolloServer.applyMiddleware({ app })

    app.get('/', (_, res) => {
        res.send('hello world');
    });
    app.listen(4000, () => {
        console.log('server started on localhost:4000');
    });
}

main();