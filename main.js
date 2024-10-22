import fastify from 'fastify';  // для написания сервера
// import pg from '@fastify/postgres'; // для работы с бд postgresql
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import 'dotenv/config';
import * as users from './routes/users.js'

// создаем объект сервера
const server = fastify({
  logger: true,
});  

//переменные окружения
const {
  SERVER_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
  JWT_SECRET,
} = process.env;

server.register(users)

// внедряем бд в сервер
// server.register(pg, {
//   connectionString: `postgres://${ DB_USERNAME }:${ DB_PASSWORD }@${ DB_HOST }/${ DB_NAME }`
// });

server.register(jwt, {
  secret: JWT_SECRET,
  sign: {
    expiresIn: '1d',
  },
});
server.register(cors);

server.listen({ port: SERVER_PORT }, (err) => {
  if (err) throw err;
  console.log(`server listening on ${ server.server.address().port }`);
});
