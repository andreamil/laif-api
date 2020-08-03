require('dotenv').config();
const express = require("express");
const app = express(),
path = require('path'),
fs = require('fs');;
const http = require('http').Server(app);
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const usuarios = require('./routes/usuario');
const projetos = require('./routes/projeto');
const registro = require('./routes/registro');
const config = require('./config');
var morgan = require('morgan');
var staticRoot = __dirname + '/../larm-web/dist/';

const jwt = require('jsonwebtoken');
var io = require('socket.io')(http);
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
                    if(err){
                        socket.emit('autorizado',false);
		                console.log('nao autorizado ',socket.id, jwt.decode(token,{json:true}).fullName);
                    }
                    else{ 
                        socket.emit('autorizado',true);
		                console.log('autorizado ',socket.id, decoded.fullName);}
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
                
                socket.on('disconnect', () => {
                    var clientIp =socket.request.connection.remoteAddress;
                    console.log(`${socket.id} desconectou-se ipv6/v4 ${clientIp}`);
                });
                
                var clientIp =socket.request.connection.remoteAddress;
                console.log(`Socket ${socket.id} conectou-se ipv6/v4 ${clientIp}`);
		
          //  }
          //});

    });
require('./porta')(io);
mongoose.connect(config.databaseURI, { useCreateIndex: true, useNewUrlParser: true })
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log(err));
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
// app.get('/', (req, res, next) => {
//     //res.send('ads')
//     res.sendFile(__dirname + '/index.html');
// });
app.use(morgan('combined',{ 
skip: (req, res)=> {
    var url = req.url;
    if(url.indexOf('?')>0)
      url = url.substr(0,url.indexOf('?'));
    if(url.match(/(js|jpg|png|ico|css|woff|woff2|eot|ttf)$/ig)) {
      return true;
    }
    return false;
  }}));
app.use('/infodump',express.Router().get('/',(req,res)=>{
const inspector = require('event-loop-inspector')();
const dump = inspector.dump();
 
res.send(dump);
}));
app.use('/usuarios', usuarios);
app.use('/projetos', projetos);
app.use('/registro', registro);
app.use('/fotosPerfil', express.static(__dirname+'/fotosPerfil'));

app.use(function(req, res, next) {
    var accept = req.accepts('html', 'json', 'xml');
    if (accept !== 'html') {
        return next();
    }

    var ext = path.extname(req.path);
    if (ext !== '') {
        return next();
    }

    fs.createReadStream(staticRoot + 'index.html').pipe(res);

});

app.use(express.static(staticRoot));

http.listen(config.port, () => {
    console.log("Funcionando! porta:"+config.port)
})
