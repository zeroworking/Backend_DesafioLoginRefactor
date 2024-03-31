import { Router } from "express";

const router = Router();

// VISTA QUE RENDERIZA EL LOGIN DE USUARIOS
router.get("/login", (req, res) => {
    res.render('login')
});

// VISTA QUE RENDERIZA EL REGISTRO DE USUARIOS
router.get("/register", (req, res) => {
    res.render('register')
});

// VISTA QUE RENDERIZA EL PROFILE DEL USUARIO
router.get("/", (req, res) => {
    res.render('profile', {
        user: req.session.user
    })
});

export default router;