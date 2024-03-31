import passport from 'passport';
import passportLocal from 'passport-local';
import GitHubStrategy from 'passport-github2';
import userModel from '../dao/models/user.model.js';
import { createHash, isValidPassword } from '../utils.js';

const localStrategy = passportLocal.Strategy;

const initializePassport = () => {
/*
=============================================
                GitHubStrategy            
=============================================
*/
    
    passport.use('github', new GitHubStrategy(
        {
            clientID: 'Iv1.12ea9e284b4cd2fd',
            clientSecret: '11bb7e045227cf62f26c0b273e0ed9e4a7d7dfd2',
            callbackUrl: 'http://localhost:8080/api/sessions/githubcallback'
        }, async (accessToken, refreshToken, profile, done) => {
                console.log("Profile obtenido del usuario:");
                console.log(profile);
                try {
                    const user = await userModel.findOne({ email: profile._json.email });
                    console.log("Usuario encontrado para login:");
                    console.log(user);

                    if (!user) {
                        console.warn("User doesn't exists with username: " + profile._json.email);

                        let newUser = {
                            first_name: profile._json.name,
                            last_name: '',
                            age: 25,
                            email: profile._json.email,
                            password: '',
                            loggedBy: 'GitHub'
                        }
                        const result = await userModel.create(newUser)
                        return done(null, result)
                    } else {
                        //Si entramos por acá significa que el usuario ya existía.
                        return done(null, user)
                    }
                } catch (error) {
                    return done(error)
                }
            }
    ))

/*
=============================================
                Local-Passport            
=============================================
*/

    passport.use('register', new localStrategy(
        // passReqToCallback: para convertirlo en un callback de request, para asi poder iteracturar con la data que viene del cliente
        // usernameField: renombramos el username
        { passReqToCallback: true, usernameField: 'email' },

        // este seria nuestro callback donde hacemos todas las validaciones
        // done: seria el equivalente al next() y con este done le indicamos que terminamos X validacion.
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body
            try {
                    const exists = await userModel.findOne({ email })
                    if (exists) {
                        console.log("El usuario ya existe!!");
                        return done(null, false)
                    }
                    //  Si el user no existe en la DB
                    const user = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: createHash(password)
                    }

                    const result = await userModel.create(user);
                    // TODO OK
                    return done(null, result)
                } catch (error) {
                    return done("Error registrando el usuario: " + error)
                }
        }
    ))
        
    passport.use('login', new localStrategy(
        { passReqToCallback: true, usernameField: 'email' },
        async (req, username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username })

                console.log("no existe un usuario con ese email")
                //console.log("Usuario encontrado para login:");
                console.log(user);

                if (!user) {
                    console.log("no existe el usuario")
                    console.warn("Invalid credentials for user: " + username);
                    return done(null, false)
                }

                // Validamos usando Bycrypt credenciales del usuario
                if (!isValidPassword(user, password)) {

                    console.log("El usuario existe pero la contraseña es incorrecta")
                    console.warn("Invalid credentials for user: " + username);
                    return done(null, false)
                }
                // req.session.user = {
                //     name: `${user.first_name} ${user.last_name}`,
                //     email: user.email,
                //     age: user.age
                // }

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    ))


/*
=============================================
Funciones de Serializacion y Desserializacion           
=============================================
*/
    passport.serializeUser((user, done) => {
        console.log("SERIALIZAR")
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            console.log("DESERIALIZAR")
            done(null, user)
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    })

};

export default initializePassport;