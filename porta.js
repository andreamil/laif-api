const mongoose = require('mongoose');
const Registro = mongoose.model('Registro');
const Usuario = mongoose.model('Usuario');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

// console.log('Conectando ao Arduino...');
//   setTimeout(function worker() {
//     console.log("reiniciando portas seriais...");
//     spFora.close();
//     spDentro.close();
//     setTimeout(worker, 1000*60*60*6);
//   }, 1000*60*60*6);
  
const spDigital = new SerialPort("COM6", {

    baudRate: 2000000
}, (err) => {
    // if (err) {
    //     var i =  setInterval(() => {        
    //         if (spDigital.isOpen){
    //             clearInterval(i)
    //         }   
    //         else{         
    //             spDigital.open((err)=>{
    //                 console.log("sensores digitais desconectados");                
    //             })     
    //         }        
    //     }, 1000);
    // }
})
const parserDigital = spDigital.pipe(new Readline({
    delimiter: '\r\n'
}))
spDigital.on('open', function () {
    console.log('sensor digital');
});
spDigital.on('close', function () {
    // var i =  setInterval(() => {        
    //     if (spDigital.isOpen){
    //         clearInterval(i);
    //     }   
    //     else{         
    //         spDigital.open((err)=>{
    //             if(err)console.log("sensores digitais desconectados");                 
    //             else clearInterval(i);
    //         })     
    //     }        
    // }, 1000);
});


parserDigital.on('data', function (data) {
    try{
        data = JSON.parse(data);
        //console.log(data);
        // if (data.noMatch) {
        //     spDigital.write("barrado");
        // }
        if (data.abrir) {
            if (data.id) {
                console.log('id:', data.id,'confidence:',data.confidence);
                module.exports.registrarIDdigital(data.id, data.direcao, true);
            }
        }
        if (data.abrir===false) {
            spDigital.write("barrado");
        }
        if (data.msg){
            console.log('msg:', data.msg);
            // if(data.msg=='readyToReceiveImage'){
            //     var buffer = Buffer.alloc(256);
            //     fs.open('imagens/imagem3.bin', 'r', function(err, fd) {
            //         if (err) {
            //             console.log(err.message);
            //             return;
            //         }
            //         var c=0;
            //         setTimeout(()=>{var interval=setInterval(()=>{
            //             if(c<288)
            //             fs.read(fd, buffer, 0, 256, null, function(err, num,linha) {
            //                 spDigital.write(linha);
            //                 console.log(linha);
            //             });
            //             else clearInterval(interval)
            //             console.log(c)
            //             c++;
            //         },100);},1000);
            //     });
            //     //dump();
            //     // spDigitalDentro.write("emptyfora");
            //      //setTimeout(()=>cadastrarDigitalID(1),1000);
            //     // restoreDumpParaFora();
            // }
            if(data.msg=='Digitais iguais (dentro)'){
                //cadastrarDigital("5c74b64c5b423417269d99c4");
                //dump();
                        
                // setTimeout(()=>{
                //     var buffer = Buffer.alloc(256);
                //     fs.open('templates/signature'+data.id+'.bin', 'r', function(err, fd) {
                //         if (err) {
                //             console.log(err.message);
                //             return;
                //         }
                //         var c=0;
                //         setTimeout(()=>{var interval=setInterval(()=>{
                //             if(c<2)
                //             fs.read(fd, buffer, 0, 256, null, function(err, num,linha) {
                //                 spDigital.write(linha);
                //                 console.log(linha);
                //             });
                //             else clearInterval(interval)
                //             console.log(c)
                //             c++;
                //         },100);},1000);
                //     });
                // },1000);
                 //setTimeout(()=>cadastrarDigitalID(1),1000);
                // restoreDumpParaFora();
            }
            if(data.msg=='sensor de fora encontrado'){
                // cadastrarDigital("5c74b64c5b423417269d99c4");
                // dump();
                // setTimeout(()=>spDigital.write('emptyfora'),1000);
                // setTimeout(()=>spDigital.write('emptydentro'),2000);
                // restoreDumpParaFora();
            }
            if(data.idUser){
                setIDDigitalUser(data.idUser,data.id);
                //console.log(data);
            }
            if(data.status){
                
                ioInstance.to(newUserTo).emit('status digital', {msg:data.msg,status:data.status,id:data.id});
                if(data.status=='cadastrandoForaTimeout'||data.statuss=='cadastrandoDentroTimeout'||data.status=='cadastradoForaSuccess'){
                    newUserTo=null;
                  }
                //console.log(data);
            }
            if(data.templatefora){
                fs.createWriteStream('templates/templatefora_'+data.id+'.bin', {encoding: 'hex',flags:'w+'}).write(data.templatefora,(err)=>{
                    if(err)console.log(err);
                    else console.log('template gravado');
                    //uploadTemplate(data.id);
                });
                //console.log(data.template);
            }
            if(data.signature1){
                fs.createWriteStream('templates/signature'+data.id+'.bin', {encoding: 'hex',flags:'w+'}).write(data.signature1,(err)=>{
                    if(err)console.log(err);
                    else console.log('template gravado');
                    //uploadTemplate(data.id);
                });
                //console.log(data.template);
            }
            if(data.signature2){
                fs.createWriteStream('templates/signature'+data.id+'.bin', {encoding: 'hex',flags:'a'}).write(data.signature2,(err)=>{
                    if(err)console.log(err);
                    else console.log('template gravado');
                    //uploadTemplate(data.id);
                });
                //console.log(data.template);
            }
            if(data.image){
                var imageDup = "";
                for(var i = 0; i < data.image.length; i++){
                    imageDup +=(data.image[i] + data.image[i]);
                }
                fs.createWriteStream('imagens/imagem'+data.id+'tst.bin', {encoding: 'hex',flags:'w+'}).write(imageDup,(err)=>{
                    if(err)console.log(err);
                    else {
                        console.log('imagem gravada');
                        
                        if(data.msg=='readyToReceiveImage'){
                            var buffer = Buffer.alloc(256);
                            fs.open('imagens/imagem'+data.id+'.bin', 'r', function(err, fd) {
                                if (err) {
                                    console.log(err.message);
                                    return;
                                }
                                var c=0;
                                setTimeout(()=>{var interval=setInterval(()=>{
                                    if(c<288)
                                        fs.read(fd, buffer, 0, 256, null, function(err, num,linha) {
                                            spDigital.write(linha);
                                            console.log(linha);
                                        });
                                    else clearInterval(interval)
                                    console.log(c)
                                    c++;
                                },100);},1000);
                            });
                            //spDigitalDentro.write(fs.readFileSync('imagens/imagem'+data.id+'.bin'));
                        }
                    }
                    //uploadTemplate(data.id);
                });
                //console.log(data.template);
            }
            if(data.templatedentro){
                fs.createWriteStream('templates/templatedentro_'+data.id+'.bin', {encoding: 'hex',flags:'w+'}).write(data.templatedentro,(err)=>{
                    if(err)console.log(err);
                    else console.log('template gravado');
                    //uploadTemplate(data.id);
                });
                //console.log(data.template);
            }
        }
    }
    catch(e){
        console.log(data);
    }
});
parserDigital.on('error', function (err) {
    console.log('Error: ', err);
})

const spFora = new SerialPort("/dev/ttyUSB0", {
    baudRate: 9600
}, (err) => {
    if (err) {
        var i =  setInterval(() => {        
            if (spFora.isOpen){
                require('fs').appendFileSync('log_reconnect.txt', 'arduino fora reconectado '+new Date()+'\n');
                clearInterval(i)
            }   
            else{         
                spFora.open((err)=>{
                    console.log("arduino fora desconectado");                
                })     
            }        
        }, 1000);
    }
})
const parserFora = spFora.pipe(new Readline({
    delimiter: '\r\n'
}))
const spDentro = new SerialPort("/dev/ttyACM0", {
    baudRate: 9600
}, (err) => {
    if (err) {
        var i =  setInterval(() => {        
            if (spDentro.isOpen){
                require('fs').appendFileSync('log_reconnect.txt', 'arduino dentro reconectado '+new Date()+'\n');
                clearInterval(i)
            }   
            else{         
                spDentro.open((err)=>{
                    console.log("arduino dentro desconectado");                
                })     
            }        
        }, 1000);
    }
})
const parserDentro = spDentro.pipe(new Readline({
    delimiter: '\r\n'
}))
var newUserTo = null;
var ioInstance;
spFora.on('open', function () {
    console.log('porta serial fora aberta');
});
spFora.on('close', function () {
    console.log('->CLOSED<-');
    console.log(spFora.isOpen);

    var i =  setInterval(() => {

        if (spFora.isOpen){
            require('fs').appendFileSync('log_reconnect.txt', 'arduino fora reconectado '+new Date()+'\n');
            clearInterval(i)
        }   
        else{         
            spFora.open((err)=>{
                console.log("arduino fora desconectado");                
            })     
        }        
    }, 1000);
});


parserFora.on('data', function (rfid) {
    console.log('RFID lido:', rfid);
    module.exports.registrarRFID(rfid, 'entrada', true);
});
parserFora.on('error', function (err) {
    console.log('Error: ', err);
})

spDentro.on('open', function () {
    console.log('porta serial dentro aberta');
});
spDentro.on('close', function () {
    console.log('->CLOSED<-');
    console.log(spDentro.isOpen);

    var i =  setInterval(() => {

        if (spDentro.isOpen){
            require('fs').appendFileSync('log_reconnect.txt', 'arduino dentro reconectado '+new Date()+'\n');
            clearInterval(i)
        }   
        else{         
            spDentro.open((err)=>{
                console.log("arduino dentro desconectado");                
            })     
        }        
    }, 1000);
});


parserDentro.on('data', function (rfid) {
    console.log('RFID lido:', rfid);
    module.exports.registrarRFID(rfid, 'saida', true);
});
parserDentro.on('error', function (err) {
    console.log('Error: ', err);
})
module.exports = function (io) {
    ioInstance = io;
    ioInstance.on('connection', socket => {
        socket.on('cadastrarDigital', (idUser) => {
            cadastrarDigital(idUser);
            newUserTo = socket.id;
        });
        socket.on('cadastrarDigitalID', (id) => {
            cadastrarDigitalID(id);
            newUserTo = socket.id;
        });
        socket.on('registrarRFID', (rfid) => {
            module.exports.registrarRFID(rfid, 'entrada', false);
        });
        socket.on('registrarRFIDentrada', (rfid) => {
            module.exports.registrarRFID(rfid, 'entrada', false);
        });
        socket.on('registrarRFIDsaida', (rfid) => {
            module.exports.registrarRFID(rfid, 'saida', false);
        });
        socket.on('get foto larm', () => {
            var digestRequest = require('request-digest')('larm', 'camera123');
            digestRequest.request({
                host: 'http://150.162.234.21',
                path: '/Camera%2001/poll.php',
                port: 8888,
                method: 'GET',
                encoding: null,
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                } else
                    socket.emit('foto larm', new Buffer(response.body).toString('base64'))
            });
        });
        socket.on('ler novo usuario', () => {
            if (newUserTo) {
                socket.emit('notificacao', {
                    body: 'Algum usuario esta cadastrando no momento, aguarde',
                    title: 'Entrada',
                    config: {
                        status: 'warning',
                        destroyByClick: true,
                        duration: 5000,
                        hasIcon: true,
                        position: 'top-right',
                    }
                })
                socket.emit('novo RFID', '');
            } else {
                newUserTo = socket.id;
                console.log('lendo novo usuario', socket.id);
                //socket.emit('lendo novo usuario', true);
                setTimeout(() => {
                    newUserTo = null;
                    socket.emit('novo RFID', '');
                }, 20000);
            }

        });
    });
}
module.exports.registrarRFID = (rfid, direcao, serialwrite) => {
    if (rfid == null) {
        var config = {
            status: 'danger',
            destroyByClick: true,
            duration: 20000,
            hasIcon: true,
            position: 'top-right',
        }
        ioInstance.emit('notificacao', {
            body: 'RFID invalido ou nulo',
            title: 'Invalido',
            config
        })
    }
    else {

        if (newUserTo != null) {
            ioInstance.to(newUserTo).emit('novo RFID', rfid);
            newUserTo = null;
        }
        Usuario.findOne({
            rfid: rfid
        }, (err, u) => {
            if (err) {
                if (serialwrite) spFora.write('NOK!')
                console.log('Erro find 1 ')
            } else {
                if (direcao == 'entrada') {
                    Registro.findOneAndUpdate({ rfid: rfid, horaSaida: null, $or: [{ invalido: null }, { invalido: false }], tipo: 'porta' },
                        { $set: { invalido: true } },
                        { new: true },
                        (err, r) => {
                            var write = (u ? (u.permissao != 'n' ? u.fullName : 'NOK') : 'NOK') + '!';
                            console.log(write);
                            if (serialwrite) spFora.write(write);
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                            var config = {
                                status: (u && u.permissao != 'n') ? 'success' : 'danger',
                                destroyByClick: true,
                                duration: 20000,
                                hasIcon: true,
                                position: 'top-right',
                            }

                            ioInstance.emit('notificacao', {
                                body: barrado + nome + '\n' + rfid,
                                title: 'Entrada',
                                config
                            })
                            if (err) {
                                console.log('Erro ao registrar entrada, ' + err);
                            }
                            else {
                                const newRegistro = {
                                    rfid: rfid,
                                    tipo: 'porta',
                                    horaEntrada: new Date()
                                }

                                if (u) newRegistro.usuario = u._id;
                                else newRegistro.invalido = true;
                                var registro = new Registro(newRegistro);
                                registro.save().then((registroCriado) => {
                                    ioInstance.emit('get usuarios no lab');
                                    console.log('Entrada registrada' + (r ? ' (entrada anterior invalidada), ' : ', ') + u ? u.fullName : 'NOK' + '!');
                                }).catch(err => {
                                    console.log('Erro ao registrar entrada, ' + err);
                                });
                            }
                        });
                }
                if (direcao == 'saida') {
                    Registro.findOneAndUpdate(
                        { rfid: rfid, horaSaida: null, $or: [{ invalido: null }, { invalido: false }], tipo: 'porta' },
                        { $set: { horaSaida: new Date() } },
                        { new: true },
                        (err, registro) => {
                            var write = (u ? (u.permissao != 'n' ? u.fullName : 'NOK') : 'NOK') + '!';
                            console.log(write);
                            if (serialwrite) spFora.write(write);
                            var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            var config = {
                                status: (u && u.permissao != 'n') ? 'warning' : 'danger',
                                destroyByClick: true,
                                duration: 20000,
                                hasIcon: true,
                                position: 'top-right',
                            }

                            ioInstance.emit('notificacao', {
                                body: barrado + nome + '\n' + rfid,
                                title: 'Saida',
                                config
                            })
                            if (err) {
                                console.log('Erro ao registrar saída, ' + err);
                            }
                            else if (registro) {
                                ioInstance.emit('get usuarios no lab');
                                console.log('Saída registrada, ' + '(saida)' + u.fullName + '!');
                            }
                            else {
                                const newRegistro = {
                                    rfid: rfid,
                                    tipo: 'porta',
                                    horaSaida: new Date(),
                                    invalido: true
                                }
                                u && (newRegistro.usuario = u._id);
                                var registro = new Registro(newRegistro);
                                registro.save().then((registroCriado) => {
                                    ioInstance.emit('get usuarios no lab');
                                    console.log('Saída registrada (inválida pois entrada não encontrada) ');
                                }).catch(err => {
                                    console.log('Erro ao registrar saída, ' + err);
                                });

                            }
                        });
                }/*
                    Registro.findOneAndUpdate({
                            rfid: rfid,
                            horaSaida: null,
                            $or: [{
                                invalido: null
                            }, {
                                invalido: false
                            }],
                            tipo: 'porta'
                        }, {
                            $set: {
                                horaSaida: new Date()
                            }
                        }, {
                            new: true
                        },
                        (err, r) => {
                            var write = (u ? (u.permissao != 'n' ? u.fullName : 'NOK') : 'NOK') + '!';
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            if (err) {
                                if(serialwrite)spDentro.write('NOK!');
                                console.log('Erro registro 1')
                            } else if (r) {
                            if(serialwrite)
                                if(write!='NOK!')spDentro.write('(saida)'+write);
                                else spDentro.write('NOK!');
                                var config = {
                                    status: 'warning',
                                    destroyByClick: true,
                                    duration: 20000,
                                    hasIcon: true,
                                    position: 'top-right',
                                }
                                ioInstance.emit('notificacao', {
                                    body: nome+'\n'+rfid,
                                    title: 'Saida',
                                    config
                                })
                                console.log('Saída registrada, '+write+' ' + rfid + ', ' + nome, r.horaEntrada?r.horaEntrada:'',r.horaSaida?r.horaSaida:'')
                            } else {
                                var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                                var registro = new Registro({
                                    rfid: rfid,
                                    tipo: 'porta',
                                    horaEntrada: new Date()
                                });
                                if(u)registro.usuario=u._id;
                                if((u && u.permissao == 'n')||!u)registro.invalido = true;

                                if(serialwrite)spDentro.write(write);
                                registro.save().then((registroCriado) => {
                                    var config = {
                                        status: (u && u.permissao != 'n') ? 'success' : 'danger',
                                        destroyByClick: true,
                                        duration: 20000,
                                        hasIcon: true,
                                        position: 'top-right',
                                    }

                                    ioInstance.emit('notificacao', {
                                        body: barrado + nome+'\n'+rfid,
                                        title: 'Entrada',
                                        config
                                    })
                                    console.log('Entrada registrada, ' + barrado + rfid + ', ' + nome, registroCriado.horaEntrada?registroCriado.horaEntrada:'',registroCriado.horaSaida?registroCriado.horaSaida:'')
                                }).catch(err => {
                                    //spDentro.write('NOK!');
                                    console.log('Erro registro 2', err)
                                });
                            }
                        });*/
            }

        });
    }
}
module.exports.registrarIDdigital = (id, direcao, serialwrite) => {
    if (id == null) {
        var config = {
            status: 'danger',
            destroyByClick: true,
            duration: 20000,
            hasIcon: true,
            position: 'top-right',
        }
        ioInstance.emit('notificacao', {
            body: 'id invalido ou nulo',
            title: 'Invalido',
            config
        })
    }
    else {

        /*if (newUserTo!=null) {
            ioInstance.to(newUserTo).emit('novo id', id);
            newUserTo = null;
        }*/
        Usuario.findOne({
            idDigital: id
        }, (err, u) => {
            if (err) {
                if (serialwrite) spFora.write('barrado')
                console.log('Erro find 1 ')
            } else {
                if (direcao == 'entrada') {
                    Registro.findOneAndUpdate({ usuario: u._id, horaSaida: null, $or: [{ invalido: null }, { invalido: false }], tipo: 'digital' },
                        { $set: { invalido: true } },
                        { new: true },
                        (err, r) => {
                            var write = (u ? (u.permissao != 'n' ? 'abrir '+u.fullName : 'barrado') : 'barrado');
                            console.log(write)
                            if (serialwrite) spDigital.write(write);
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                            var config = {
                                status: (u && u.permissao != 'n') ? 'success' : 'danger',
                                destroyByClick: true,
                                duration: 20000,
                                hasIcon: true,
                                position: 'top-right',
                            }
                            ioInstance.emit('notificacao', {
                                body: barrado + nome + '\n' + id,
                                title: 'Entrada',
                                config
                            })
                            if (err) {
                                console.log('Erro ao registrar entrada, ' + err);
                            }
                            else {
                                const newRegistro = {
                                    idDigital: id,
                                    tipo: 'digital',
                                    horaEntrada: new Date()
                                }

                                if (u) newRegistro.usuario = u ? u._id : null;
                                else newRegistro.invalido = true;
                                var registro = new Registro(newRegistro);
                                registro.save().then((registroCriado) => {
                                    ioInstance.emit('get usuarios no lab');
                                    console.log((r ? ' (entrada anterior invalidada), ' : ', ') ,'id: ',id,' u: ',u?u.fullName:'Usuario nao cadastrado');
                                }).catch(err => {
                                    console.log('Erro ao registrar entrada, ' + err);
                                });
                            }
                        });
                }
                if (direcao == 'saida') {
                    Registro.findOneAndUpdate(
                        { usuario: u._id, horaSaida: null, $or: [{ invalido: null }, { invalido: false }] ,tipo:'digital'},
                        { $set: { horaSaida: new Date() } },
                        { new: true },
                        (err, registro) => {
                            var write = (u ? (u.permissao != 'n' ? 'sair': 'barrado') : 'barrado');
                            if (serialwrite) spDigital.write(write);
                            var barrado = (u && u.permissao != 'n') ? '' : '(BARRADO) ';
                            var nome = u ? u.fullName : 'Usuario nao cadastrado';
                            var config = {
                                status: (u && u.permissao != 'n') ? 'warning' : 'danger',
                                destroyByClick: true,
                                duration: 20000,
                                hasIcon: true,
                                position: 'top-right',
                            }

                            ioInstance.emit('notificacao', {
                                body: barrado + nome + '\n' + id,
                                title: 'Saida',
                                config
                            })
                            if (err) {
                                console.log('Erro ao registrar saída, ' + err);
                            }
                            else if (registro) {
                                ioInstance.emit('get usuarios no lab');
                                console.log('Saída registrada' ,write)
                            }
                            else {
                                const newRegistro = {
                                    idDigital: id,
                                    tipo: 'digital',
                                    horaSaida: new Date(),
                                    invalido: true
                                }
                                if(u){
                                    newRegistro.usuario = u._id;
                                    console.log(u.fullName)
                                }
                                var registro = new Registro(newRegistro);
                                registro.save().then((registroCriado) => {
                                    ioInstance.emit('get usuarios no lab');
                                    console.log('Saída registrada (inválida pois entrada não encontrada) ' );
                                }).catch(err => {
                                    console.log('Erro ao registrar saída, ' + err);
                                });

                            }
                        });
                }
            }

        });
    }
}
getTemplate = (num) => {
    spDigital.write("getTemplate");
    setTimeout(()=>{spDigital.write(num.toString());},500)

}     
dump = () => {
    spDigital.write("dump");
}     
cadastrarDigital = (idUser) => {
    spDigital.write("lercadastrar");
    setTimeout(()=>{spDigital.write(idUser.toString());},500)
}       
setIDDigitalUser=(idUser,id)=>{
    Usuario.findOneAndUpdate({
        _id: idUser
    },{$set : {idDigital: id}}, (err, u) => {
        if(u)
            console.log(u);
        if(err)
            console.log(err);
    });
}
cadastrarDigitalID = (id) => {
        // Usuario.findOne({
        //     idUser: idUser
        // }, (err, u) => {
                    spDigital.write("lercadastrarid");
                    setTimeout(()=>{spDigital.write(id.toString());},500)
            //  });

}       

uploadTemplate = (id) => {
            spDigital.write("cadastrarid");
        setTimeout(()=>{
            setTimeout(()=>{spDigital.write(id.toString());
            spDigital.write(fs.readFileSync('templates/template_'+id+'.bin'));},300)
        },500)
}       
const fs = require('fs');
restoreDumpPara = () => {
    fs.readdir('templates', (err, files) => {
        var count=0;
        var interval = setInterval(()=>{
                if(count<files.length){
                    spDigital.write("cadastrariddentro");
                    setTimeout(()=>{spDigital.write(files[count].match(/\d+/g).toString());
                    console.log(fs.readFileSync('templates/'+files[count]))
                    spDigital.write(fs.readFileSync('templates/'+files[count]));
                    count++;},300)
                }
                else clearInterval(interval);
            },700)
      });
}       
restoreDumpParaDentro = () => {
    fs.readdir('templates', (err, files) => {
        var count=0;
        var interval = setInterval(()=>{
                if(count<files.length){
                    spDigital.write("cadastrariddentro");
                    setTimeout(()=>{spDigital.write(files[count].match(/\d+/g).toString());
                    console.log(fs.readFileSync('templates/'+files[count]))
                    spDigital.write(fs.readFileSync('templates/'+files[count]));
                    count++;},1000)
                }
                else clearInterval(interval);
            },2000)
      });
}       
restoreDumpParaFora = () => {
    fs.readdir('templates', (err, files) => {
        var count=0;
        var interval = setInterval(()=>{
                if(count<files.length){
                    spDigital.write("cadastraridfora");
                    setTimeout(()=>{spDigital.write(files[count].match(/\d+/g).toString());
                    console.log(fs.readFileSync('templates/'+files[count]))
                    spDigital.write(fs.readFileSync('templates/'+files[count]));
                    count++;},1000)
                }
                else clearInterval(interval);
            },2000)
      });
}       
