import { Router } from "express";
const router = Router();
import cartManager from "../dao/cartManager.js";
const carts = new cartManager();
import productManager from "../dao/productManager.js";
const products = new productManager();

// RUTA PARA LISTAR TODOS LOS CARROS
router.get('/', async (req, res) => {
  try{
    const cart = await carts.getCarts();
    res.status(200).json({ status: "success", message: "Listado de todos los carros.", cart: cart });
  }catch(error){
    console.error("Hubo un error al intentar listar los carros", error);
    res.status(500).send("Error interno del servidor");
  };
});

// RUTA PARA CREAR NUEVO CARRO
router.post('/', async (req, res) => {
    try {
        const cart = await carts.addCart();        
        res.status(200).json({ status: "success", message: "El carro fue creado correctamente.", cart: cart });
    } catch (error) {
        console.error("Hubo un error al crear el carro", error);
        res.status(500).send("Error interno del servidor");
    }
});

// RUTA PARA ACTUALIZAR EL CARRITO CON UN ARREGLO DE PRODUCTOS
router.put('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const products = req.body;    
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: "error", message: "Los productos deben ser enviados como arreglo." });
    }   
    const cart = await carts.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "El carro no fue encontrado." });
    }   
    const updatedCart = await carts.updateCartWithProducts(cid, products);    
    res.status(200).json({ status: "success", message: "El carrito fue actualizado con éxito.", cart: updatedCart });
  } catch (error) {
    console.error("Hubo un error al actualizar el carrito", error);
    res.status(500).send("Error interno del servidor");
  }
});

// RUTA PARA AGREGAR UN PRODUCTO A UN CARRO
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const cart = await carts.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "El carro no fue encontrado." });
    }    
    const product = await products.getProductById(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "El producto no fue encontrado." });
    }   
    const currentCart = await carts.addProduct(cid, pid);
    return res.status(200).json({ status: "success", message: "El producto fue agregado correctamente al carro." });  
  } catch(error) {
    console.error("Hubo un error al intentar agregar el producto al carro", error);
    return res.status(500).send("Error interno del servidor");
  }
});

// RUTA PARA CONSULTAR PRODUCTOS DE UN CARRO POR SU ID
router.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await carts.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "El carro no fue encontrado." });
    }
    res.status(200).json({ cart });
  } catch(error) {
    console.error("Hubo un error al listar el carro por su id", error);
    res.status(500).send("Error interno del servidor");
  }
});

// RUTA PARA ACTUALIZAR LA CANTIDAD DE UNIDADES DE UN PRODUCTO EN EL CARRO
router.put('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const quantity = parseInt(req.body.quantity); // Convertir a número entero
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ status: "error", message: "La cantidad de unidades debe ser un número mayor a 0." });
    } 
    const cart = await carts.getCartById(cid);
    const product = await products.getProductById(pid);    
    if (!cart) {
      return res.status(404).json({ status: "error", message: "El carro no fue encontrado." });
    }
    if (!product) {
      return res.status(404).json({ status: "error", message: "El producto no fue encontrado." });
    }    
    await carts.updateProductQuantityToCart(cid, pid, quantity); // Actualizar la cantidad de unidades
      return res.status(200).json({ status: "success", message: "Cantidad de unidades del producto actualizada correctamente." });  
  } catch (error) {
    console.error("Hubo un error al intentar actualizar la cantidad de productos en el carro", error);
    return res.status(500).send("Error interno del servidor");
  }
});

// RUTA PARA ELIMINAR TODOS LOS PRODUCTOS DE UN CARRO EXISTENTE
router.delete('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await carts.deleteAllProductsFromCart(cid);
    if (cart) {      
      res.status(200).send({ status: "success", message: "Todos los productos fueron eliminados del carro." });    
    } else {      
      res.status(404).send({ status: "error", message: "El carro no fue encontrado." });
    }
  } catch (error) {
    console.error("Hubo un error al eliminar los productos del carro:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// RUTA PARA ELIMINAR UN PRODUCTO A UN CARRO
router.delete('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const cart = await carts.getCartById(cid);
    if (!cart) {
      return res.status(404).send({ status: "error", message: "El carro no fue encontrado." });
    }
    const product = await products.getProductById(pid);   
    if (!product) {
      return res.status(404).send({ status: "error", message: "El producto no fue encontrado." });
    }
    const currentCart = await carts.deleteProductToCart(cid, pid);
    res.status(200).json({ status: "success", message: "El producto fue eliminado correctamente del carro." });  
  } catch(error) {
    console.error("Hubo un error al eliminar el producto del carro", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;