//список функций:
    // регистрировать пользователя 
    // авторизовать пользователя
    // поменять пароль
    // получить список пользователей ok
    // удалить пользователя
    // найти пользователя по айди
    // забыть пользователя
    //проверка refresh token
    //
    //. . .

const validRefreshToken = async(token) =>{
    try {
        // Проверяем refresh токен
        const decoded = await request.jwtVerify(token);
        // Если токен действителен, создаем новый access токен
        // const newAccessToken = fastify.jwt.sign({ id: decoded.id });
    
        return decoded;
      } catch (err) {
        reply.status(401).send({ error: 'Invalid refresh token' });
        return null
      }
};

const routes = async (fastify, options) => {

    fastify.get('/users', async (request, reply) => {
        const { rows: users } = await fastify.pg.query(`--sql
          SELECT * from users;
        `);
        
        return users;
    });
    fastify.post('/protected', async(request, reply) => {

    });
    fastify.post('/users/login', async (request, reply) => {
        const { phone, password } = {"phone":8900000000, 'password':'Tyoma2008'};
        // const { phone, password } = request.body;
    
        // const { rows: user } = (await fastify.pg.query(`--sql
        //   SELECT * FROM users
        //   WHERE phone = $1;
        // `, [phone]));
    
        // const userData = user.length ? user[0] : null;
    
        // if (!userData) {
        //   return reply.code(401).send({
        //     message: 'Неверный номер телефона',
        //   });
        // }
    
        // const isValidPassword = await bcrypt.compare(password, userData.password);
    
        // if (!isValidPassword) {
        //   return reply.code(401).send({
        //     message: 'Неверный пароль',
        //   });
        // }
        const userData = {
            'user_id':52,
            'phone':8900000000,
            'username':'goool'
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
    
     
      
}

export default routes