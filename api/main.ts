import { ApiHandler } from '../src/types/server';

const handler: ApiHandler = (req, res) => {
    const { name = 'World' } = req.query;
    const date = new Date();
    res.status(200).send(`Hello ${name}! Date ${date.toLocaleDateString('ru-RU')}`);
};

module.exports = handler;
