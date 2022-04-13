import { resolve } from 'path'
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'development') {
    config({
        path: resolve(__dirname, '.env.local'),
    });
} else {
    
}
