import {Router} from 'express';
import ManagerProducts from '../models/ManagerProducts.js';

const managerProducts = new ManagerProducts();

const productsRouter = Router();

productsRouter.get('/', async (req, res) => {
    try {
        const products = await managerProducts.getProducts();
        const {limit} = req.query;

        if(parseInt(limit,10) > 0){
            
            res.status(200).send(products.slice(0, limit));
        }else{
            res.status(200).send(products);
        }

    } catch (error) {
        res.status(400).send(`${error}`)
    }
})

productsRouter.get('/:id', async (req, res) => {
    try {
        
        const prod = await managerProducts.getProductById(parseInt(req.params.id, 10))
        if(prod){
            res.status(200).send(prod)
        }else{
            res.status(200).send("Producto no encontrado!!")
        }
        
    } catch (error) {
        res.status(400).send(`${error}`)
    }
})

productsRouter.post('/', async (req, res) => {

    try {
        const prod = req.body;

    //Validamos que el código no exista y que los campos obligatorios no sean undefined

    if(await managerProducts.isCodeExisting(prod.code)){
        res.status(400).send(`El código "${prod.code}" ya existe. Producto no agregado!!`)
    }else if(!managerProducts.validateProduct(prod)){
        res.status(400).send("Hay campos obligatorios sin completar. Producto no agregado!!")
    }else{
        await managerProducts.addProduct(prod);
        res.status(200).send("Producto agregado con éxito!!")
    }
    } catch (error) {
        res.status(400).send(`${error}`)
    }
})

productsRouter.put('/:id', async (req,res) => {
    try {
        if (!await managerProducts.isIdExisting(parseInt(req.params.id,10))){
            res.status(400).send(`El producto con ID ${req.params.id} no existe para ser actualizado!!`)
        }else{
            managerProducts.updateProduct(req.body, parseInt(req.params.id, 10))
            res.status(200).send(`El producto con ID ${req.params.id} fue actualizado con éxito!!`)
        }
    } catch (error) {
        res.status(400).send(`${error}`)
    }
})

productsRouter.delete('/:id', async (req,res) => {
    try {
        const id = parseInt(req.params.id,10);
        if (id === NaN || !await managerProducts.isIdExisting(id)){
            res.status(400).send(`El producto con ID ${req.params.id} no existe para ser Eliminado!!`)
        }else{
            managerProducts.deleteProduct(id)
            res.status(200).send(`El producto con ID ${req.params.id} fue eliminado con éxito!!`)
        }
    } catch (error) {
        res.status(400).send(`${error}`)
    }
})





export default productsRouter;