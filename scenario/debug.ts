import { debug } from 'debug';

const log = debug('app');

const hookLog = log.extend('hook');
const httpLog = log.extend('http');

debug.enable('app:*')

export { hookLog, httpLog };
