import express from 'express';
import { engine } from 'express-handlebars';;
import path from 'path';
import { __dirname } from './path.js';
import ManagerProducts from './models/ManagerProducts.js';
import productsRoutes from './routes/products.routes.js';
import {Server} from 'socket.io';






const app = express();

app.use(express.json()); // Convertir lo que está en el body que son string JSon , en objetos javascript
app.use(express.urlencoded({extended:true})) //Para manejar URL extensas
app.use('/api/products', productsRoutes)



//Configuración carpeta estática
app.use('/', express.static(path.join(__dirname, '/public')))

//configuración handlebars
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.resolve(__dirname, './views'))


const PORT = 4000;

const server = app.listen(PORT, () => {console.log(`Server on PORT ${PORT} : http://localhost:4000/`)});

//Usuamos socket.io

const io = new Server(server);

app.get('/', async (req, res) => {
    try {
        const manager = new ManagerProducts();
        //const data = await manager.getProducts();
        const data = await manager.getProducts();
        res.render('home', {
            data,
            css: 'style.css',
            tittle: 'Products'
        }); // Renderiza la página HTML y pasa los datos como contexto
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});






app.get('/realtimehandlebars', async (req, res) => {
    try {
        const manager = new ManagerProducts();
        //const data = await manager.getProducts();
        const data = await manager.getProducts();
        res.render('realTimeProducts', {
            data,
            css: 'style.css',
            tittle: 'Products'
        }); // Renderiza la página HTML y pasa los datos como contexto
    } catch (error) {
        console.error(error);
        res.status(500).send('Error interno del servidor');
    }
});



io.on('connection', (socket) => {
    console.log("Servidor socket.io conectado!!");
    
    socket.on("agregarProducto", async(prod) => {
        
        const managerProducts = new ManagerProducts();
        
        let mensaje = "Mensaje del servidor"

        if(await managerProducts.isCodeExisting(prod.code)){
            mensaje = `El código "${prod.code}" ya existe. Producto no agregado!!`
        }else if(!managerProducts.validateProduct(prod)){
            mensaje = "Hay campos obligatorios sin completar. Producto no agregado!!";
        }else{
            await managerProducts.addProduct(prod);
            mensaje = "Producto agregado con éxito!!"
        }
        console.log(`Este es un mensaje: ${mensaje}`)
    
        
        socket.emit('mostrarProducto', mensaje)
    });
   
    socket.on("eliminarProducto", async (code)=>{
        const managerProducts = new ManagerProducts();
        let mensaje = "";
        if (code === NaN || !await managerProducts.isCodeExisting(code)){
            mensaje = `El producto no existe para ser Eliminado!!`
        }else{
            
            await managerProducts.deleteProductByCode(code)
            mensaje = `El producto con CODE ${code} fue eliminado con éxito!!`
        }

        socket.emit("mostrarEliminado", mensaje)
    })
   
    
})



