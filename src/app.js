import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
// PASSPORT IMPORTS
import passport from 'passport';
import initializePassport from './config/passport.config.js';
// ROUTERS
import viewRoutes from './routes/views.router.js';
import usersViewsRouter from './routes/users.views.router.js'
import sessionRouter from './routes/session.router.js'
import githubLoginViewRouter from './routes/github-login.views.router.js'
import productsRoutes from './routes/products.router.js';
import cartsRoutes from './routes/carts.router.js';

import { Server } from 'socket.io';
import { chatModel } from './dao/models/chat.model.js';

const app = express();
const PORT = 8080;

// MIDDLEWARE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HANDLEBARS
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + "/views");
app.set('view engine', 'handlebars');

// ARCHIVOS ESTATICOS
app.use(express.static(__dirname + "/public"))

const URL_MONGO = 'mongodb+srv://ZeroWorking:wxYoVrR9Tcj89zIt@zeroworking.ihft1zn.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=ZeroWorking';

app.use(session({
    store: MongoStore.create({
        mongoUrl: URL_MONGO,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 10 * 60 // Tiempo de vida de la sesión en segundos
    }),
    secret: "coderS3cr3t",
    resave: false,
    saveUninitialized: true
}));

//Middlewares Passport
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// RUTAS MONGO
app.use('/users', usersViewsRouter);
app.use('/api/sessions', sessionRouter);
app.use("/github", githubLoginViewRouter);
app.use('/api/products',productsRoutes)
app.use('/api/carts',cartsRoutes)

// RUTA VIEWS-HANDLEBARS
app.use('/', viewRoutes)

const httpServer = app.listen(PORT, () => {
    console.log(`Server run on port: ${PORT}`);
})


// INSTANCIA DE SOCKET.IO
const socketServer = new Server(httpServer);

// MANEJO DE LA CONEXION WEBSOCKET
socketServer.on("connection", async (socket) => {
    console.log("Un usuario se ha conectado");
  
    // OBTIENE LOS MENSAJES DEL CHAT Y LOS EMITE A LOS CLIENTES
    try {
        const messages = await chatModel.find({});
        socket.emit("initialMessages", messages);
    } catch (error) {
        console.error(error);
    }
  
    // MANEJO DE NUEVO MENSAJE ENVIADO POR EL CLIENTE
    socket.on("chatMessage", async (data) => {
        const { user, mensaje } = data;
  
        // GUARDA EL MENSAJE EN LA BASE DE DATOS
        try {
            const newMessage = new chatModel({
                user,
                mensaje,
            });
            await newMessage.save();
  
            // EMITE EL MENSAJE A TODOS LOS CLIENTES
            socketServer.emit("chatMessage", newMessage);
        } catch (error) {
            console.error(error);
        }
    });

});

const connectMongoDB = async () => {
    try {
        await mongoose.connect(URL_MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Conectado exitosamente a MongoDB usando Mongoose");
    } catch (error) {
        console.error("No se pudo conectar a la base de datos usando Mongoose: " + error);
        process.exit(1); // Salir del proceso con un código de error
    }
};
connectMongoDB();