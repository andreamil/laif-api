const config = require('./config');

const jwt = require('jsonwebtoken');

var io;
module.exports = (http)=>{
    io = require('socket.io')(http);
    io.on('connection', socket => {
        //jwt.verify(socket.handshake.query.token, config.secret,(err,decoded)=>{
          //  if(err){
         //   console.log(`Socket ${socket.id} has connected (erro ou não autenticado) ${socket.handshake.query.token}`);
         //   socket.emit('autorizado',false);
         //   socket.disconnect();
         //   }
         //   else{
                //socket.emit('autorizado',true);
                socket.on('check autorizado', (token) => {
                    jwt.verify(token, config.secret,(err,decoded)=>{
                    if(err)socket.emit('autorizado',false)
                    else socket.emit('autorizado',true)
		    console.log('check '+socket.id)
                    })
                });
                socket.on('projetos', () => {
                    socket.join('projetosRoom');
                });
                socket.on('getProjetos', () => {
                    socket.join('projetosRoom');
                    //console.log(token);
                    socket.emit('projetos', [{titulo: 'sdadsa13131d', lider:{fullname: 'Andre 1',role: 'admin'}},{titulo: 'sdadsa3131ddsadse131', lider:{fullname: 'Andre 2',role: 'admin'}}]);
                });
                //console.log(decoded)
                console.log(`Socket ${socket.id} has connected`);
		
          //  }
          //});

    });
}

module.exports.io = io;
module.exports.emitirTodos=(event,data)=>{
    io.emit(event,data);
}
