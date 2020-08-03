const { Usuario } = require('./model/Usuario');
const config = require('./config');

const jwt = require('jsonwebtoken');

auth_middleware = (req, res, next) => {
  const bearerHeader = req.headers['authorization']
  if(typeof bearerHeader !== 'undefined'){
      try {
          const bearerToken = bearerHeader.split(' ')[1];
          jwt.verify(bearerToken, config.secret,(err,decoded)=>{
            if(err)res.status(403).json(err);
            else{
              req.decoded=decoded;
              next();
            }
          });
      } catch (err) {
          console.log(err);
          res.status(403).json(err);
      }
  }else{
      res.sendStatus(403)
  }
}
permitir = (...allowed) => {
  return (req, res, next) => {
  
    if(allowed.filter(value => req.decoded.role.includes(value)).length > 0)
      next();
    else {
      res.status(403).json({message: "Forbidden"});
    }
  }
}

module.exports = { auth_middleware, permitir};
