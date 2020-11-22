import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";

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
}

main();