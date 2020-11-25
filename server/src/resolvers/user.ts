import { Resolver, Ctx, Arg, Mutation, Field, ObjectType, Query } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from 'src/types';
import argon2 from "argon2";
import {EntityManager} from '@mikro-orm/postgresql';
import { COOKIE_NAME } from '../constants';


@ObjectType()
class FieldError{
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {

    @Query(() => User, {nullable: true})
    async me(
        @Ctx() {req, em}: MyContext
    ) {
        // @ts-ignore
        if(!req.session.userId){
            return null;
        }
        const user = await em.findOne(User, {
            // @ts-ignore
            id: req.session.userId
        });
        return user;

    }

    // register user
    @Mutation(() => UserResponse )
    async register(
        @Arg('username', () => String) username: string,
        @Arg('password', () => String) password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        // validate username
        if(username.length <= 6) {
            return {
                errors: [{
                    field: "username",
                    message: "username must be greater than 6 characters"
                }]
            }
        }
        // validate password
        if(password.length <= 6) {
            return {
                errors: [{
                    field: "password",
                    message: "password must be greater than 6 characters"
                }]
            }
        }
        const hashedPassword = await argon2.hash(password);
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert({
                username: username.toLowerCase(),
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date()
            }).returning("*");
            user = result[0];
        } catch (err) {
            if (err.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: "username",
                        message: "username is already in use"
                    }]
                };
            }
        }

        // store user id session to keep user logged in with cookie
        // @ts-ignore
        req.session.userId = user.id;
        
        return {user};
    }

    // create post
    @Mutation(() => UserResponse )
    async login(
        @Arg('username', () => String) username: string,
        @Arg('password', () => String) password: string,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
       
        const user = await em.findOne(User, {
            username: username.toLowerCase()
        });

        console.log(user);

        if(!user) {
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist."
                }]
            };
        }
        const valid  = await argon2.verify(user.password, password);
        if(!valid) {
            return {
                errors: [{
                    field: "password",
                    message: "incorrect password"
                }]
            };
        }

        // @ts-ignore
        req.session.userId = user.id;

        return {
            user
        }
    }

    // logout user
    @Mutation(() => Boolean )
    logout(
        @Ctx() {req, res}: MyContext
    ){
        
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME);
            if(err) {
                console.log(err);
                resolve(false);
                return;
            } 
            resolve(true);
        }));
    }

}