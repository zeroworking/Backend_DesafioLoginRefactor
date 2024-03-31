import { cartModel } from "./models/cart.model.js";
export default class cartManager {

  async getCarts() {
    try {      
      const carts = await cartModel.find().lean().exec();
      return carts;
    } catch (error) {
      console.error(`Error al intentar obtener los carritos: ${error}`);
    }
  };

  async addCart() {
    try {
      const newCart = await cartModel.create({ products: [] });
      return newCart;
    } catch (error) {
      console.error(`Error al intentar crear un nuevo carrito: ${error}`);
    }
  };

  async getCartById(cid) {
    const cart = await cartModel.findById(cid).populate('products.product').lean().exec();
    return cart;
  };
  
  async deleteAllProductsFromCart(cid) {
    try {
      const cart = await cartModel.findById(cid);
      if (cart) {
        cart.products = []; 
        await cart.save();
        return cart;
      } else {
        console.log('El carro especificado no se encuentra.');
        return null;
      }
    } catch (error) {
      console.error(`Error al intentar eliminar todos los productos del carro: ${error}`);
      return null;
    }
  };

  async addProduct(cid, pid) {
    const newProduct = { product: pid, quantity: 1 };
    try {
      const cart = await cartModel.findById(cid);
      const indexProduct = cart.products.findIndex((item) => item.product == pid);

      if (indexProduct < 0) {
        cart.products.push(newProduct);
      } else {
        cart.products[indexProduct].quantity += 1;
      }
      await cart.save();
      return cart;
    } catch (error) {
      console.error(`Error al intentar agregar un producto al carrito: ${error}`);
    }
  };

  async deleteProductToCart(cid, pid) {
    try {
      const cart = await cartModel.findById(cid);
      const indexProduct = cart.products.findIndex((item) => item.product == pid);
      if (indexProduct >= 0) {      
        cart.products.splice(indexProduct, 1);
        await cart.save();
      } else {
        console.log('El producto especificado no se encuentra en el carrito.');
      }
      return cart;
    } catch (error) {
      console.error(`Error al intentar eliminar un producto del carrito: ${error}`);
    }
  };

  async updateProductQuantityToCart(cid, pid, quantity) {
    try {
        const cart = await cartModel.findById(cid);
        const indexProduct = cart.products.findIndex(item => item.product == pid);
        if (indexProduct < 0) {
            console.error("El producto no existe en el carrito.");
            return null;
        } else {
            cart.products[indexProduct].quantity = quantity;
        }
        await cart.save();
        return cart;
    } catch (error) {
        console.error(`Error al intentar actualizar la cantidad del producto en el carrito: ${error}`);
    }
  };

  async updateCartWithProducts(cid, products) {
    try {        
        const cart = await cartModel.findById(cid);   
        if (!cart) {
            throw new Error('El carrito especificado no existe');
        }              
        cart.products = products;   
        await cart.save();      
        return cart; 
    } catch (error) {        
        throw new Error(`Error al actualizar el carrito: ${error.message}`);
    }
  };

} 