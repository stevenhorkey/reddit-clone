import { Resolver, Ctx, Arg, Mutation, Field, ObjectType } from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from 'src/types';
import argon2 from "argon2";


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

    // register user
    @Mutation(() => UserResponse )
    async register(
        @Arg('username', () => String) username: string,
        @Arg('password', () => String) password: string,
        @Ctx() {em}: MyContext
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
        const user = em.create(User, {
            username: username.toLowerCase(),
            password: hashedPassword
        });

        try {
            await em.persistAndFlush(user);
        } catch (err) {
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return {
                    errors: [{
                        field: "password",
                        message: "username is already in use"
                    }]
                };
            }
        }
        
        return {user};
    }

    // create post
    @Mutation(() => UserResponse )
    async login(
        @Arg('username', () => String) username: string,
        @Arg('password', () => String) password: string,
        @Ctx() {em}: MyContext
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

        return {
            user
        }
    }

}