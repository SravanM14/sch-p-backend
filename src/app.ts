import express, {Application}from "express";
import cors from 'cors';
import helmet from 'helmet';
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from './routes';

const app:Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(compression())
app.use(morgan("dev"))
app.use(helmet())
app.use(cookieParser())


app.get('/', (req, res)=>{
    res.send('School management Backend API')
})

/**
 * API Version 1
 */

app.use('/api/v1', routes)

export default app;