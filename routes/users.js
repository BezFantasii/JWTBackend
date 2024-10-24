//список функций:
    // регистрировать пользователя ok
    // авторизовать пользователя ok
    // поменять пароль ok
    // получить список пользователей ok
    // удалить пользователя ok
    // найти пользователя по айди ok
    // забыть пользователя frontend
    //проверка refresh token
    //
    //. . .
import bcrypt from 'bcrypt';


const validRefreshToken = async(token, request, reply) =>{
    try {
      if (!token) {
        return reply.status(401).send({ message: 'Refresh token is required' });
      }
      else{
        // Проверяем refresh токен
        const decoded = await fastify.jwt.verify(token);
        // Если токен действителен, создаем новый access токен
        // const newAccessToken = fastify.jwt.sign({ id: decoded.id });
        reply.decoded
        return token;}
      } catch (err) {
        return null
      }
};

const routes = async (fastify, options) => {
// get запросы
    fastify.get('/users', async (request, reply) => {
      try{
        const { rows: users } = await fastify.pg.query(`--sql
          SELECT * from users;
        `);
        return users;
      } catch(e){
        reply.code(500).send(e)
      }
    });
    fastify.get('/users/:id', async (request, reply) => {
      const {id} = request.params;
      try{
        const { rows:res} = await fastify.pg.query(`--sql
          SELECT * from users
          WHERE user_id = $1
        `,[id])
        return res
      }catch(e){
        reply.code(500).send(e)
      }
    })
//post запросы

  fastify.post('/users', async (request, reply) => {
    const { phone, username, password } = request.body;

    const { rows: isValidPhone } = await fastify.pg.query(`--sql
      SELECT * FROM users
      WHERE phone = $1;
    `, [phone]);

    if (isValidPhone.length) {
      return reply.code(401).send({
        message: 'Пользователь с этим номером телефона уже существует',
      });
    };

    const { rows: user } = await fastify.pg.query(`--sql
      SELECT * FROM users
      WHERE username = $1;
    `, [username]);

    if (user.length) {
      return reply.code(401).send({
        message: 'Пользователь с этим username уже существует',
      });
    }

    try {
      const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
      const hash = await bcrypt.hash(password, salt);
      const { rowCount } = await fastify.pg.query(`--sql
        INSERT INTO users (phone, username, password)
        VALUES ($1, $2, $3);
      `, [phone, username, hash]);

      reply.code(201).send({
        rowCount,
      });
    } catch (error) {
      console.error(error);
      reply.code(500).send({
        error,
      });
    }
  });
    fastify.post('/protected', async(request, reply) => {

    });
    fastify.post('/users/login', async (request, reply) => {
        const { phone, password } = request.body;
    
        const { rows: user } = (await fastify.pg.query(`--sql
          SELECT * FROM users
          WHERE phone = $1;
        `, [phone]));
    
        const userData = user.length ? user[0] : null;
    
        if (!userData) {
          return reply.code(401).send({
            message: 'Неверный номер телефона',
          });
        }
    
        const isValidPassword = await bcrypt.compare(password, userData.password);
    
        if (!isValidPassword) {
          const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
          const hash = await bcrypt.hash("Tyoma2008", salt);
          return reply.code(401).send({

            message: 'Неверный пароль',
            hash: hash,
            isValidPassword: isValidPassword,
            userData: userData.password,
            password: password
          });
        }

        const payload = {
          user_id: userData.user_id,
          phone: userData.phone,
          username: userData.username,
          iat: Math.floor(Date.now() / 1000), // время создания токена
          exp: Math.floor(Date.now() / 1000) + 30
        };
        const payload2 = {
          yeat: 'zxc',
          iat: Math.floor(Date.now() / 1000), // время создания токена
          exp: Math.floor(Date.now() / 1000) + 60 * 60
        }
        const token = fastify.jwt.sign(payload, { expiresIn: '30m' });
        const token2 = fastify.jwt.sign(payload2, { expiresIn: '60d' } )
        const decodedToken = validRefreshToken(token2)
        
        return {
          accessToken: token,
          refreshToken: token2,
          decodedToken: decodedToken
        };
      });
      fastify.post('/refresh-token/', async (request, reply) => {
        const { refreshToken } = request.body;
      
        if (!refreshToken) {
          return reply.status(401).send({ message: 'Refresh token is required' });
        }
      
        try {
          // Проверка refresh токена
          const decoded = await fastify.jwt.verify(refreshToken);
          
          // Если токен действителен, создайте новый access токен
          const newAccessToken = fastify.jwt.sign({ id: decoded.id });
      
          return reply.send({ accessToken: newAccessToken });
        } catch (err) {
          return reply.status(403).send({ message: 'Invalid refresh token' });
        }
      });
     fastify.post('/users/changeData/:id', async (request, reply) => {
      const {id} = request.params
      const { phone, username, password } = request.body;
      try{
        const { rows: changeData } = await fastify.pg.query(`--sql
          UPDATE users
          SET phone = $1,
              username = $2,
              password = $3
          WHERE user_id =$4
        `, [phone, username, password, id]);
        return changeData
      }catch(e){
        reply.code(500).send(e)
      }

    })
//delete запросы
  fastify.delete('/users/delete/:id', async (request, reply) => {
    const {id} = request.params;

    try{
      const res = await fastify.pg.query(`--sql
              DELETE FROM users
              WHERE user_id = $1
      `,[id])
      if (res.rowCount === 0) {
        reply.code(404).send({ message: 'Review not found' });
      } else {
        reply.send({ message: 'Review deleted' });
      }    
    } catch(e){
      reply.code(500).send({ message: 'Error deleting review gool', error: e });
    }
  })
}

export default routes