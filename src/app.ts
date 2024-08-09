import express, { Request, Response } from 'express';
import cors from 'cors';
import { Controllers } from './app/controller';
const app = express()
const port = 5000

app.use(express.json());
app.use(cors())

// test endpoint
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        systemHealth: 'Normal',
        message: 'Hello World'
    });
});

// Application Routes
app.post('/api/v1/upload/single', Controllers.single)

// not found endpoint
app.all('*', (req: Request, res: Response) => {
    res.status(404).send('not found');
});

// global error handler
app.use((err: any, req: Request, res: Response) => {
    const message = err.message || 'Something Wrong';

    return res.status(500).json({
        success: false,
        message,
        err
    });
});

app.listen(port, () => {
    console.log(`Uploader app listening on port ${port}`)
})