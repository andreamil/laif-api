const mongoose = require('mongoose');
const Registro = mongoose.model('Registro');
const Usuario = mongoose.model('Usuario');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const sp = new SerialPort("COM4", {
    baudRate: 9600
}, (err) => {
    if (err) {
        var count =0;
        var i =  setInterval(() => {        
            if (sp.isOpen){
                require('fs').appendFileSync('log_reconnect.txt', 'arduino reconectado '+new Date()+'\n');
                clearInterval(i)
                count=0;
            }   
            else{         
                sp.open((err)=>{
                    if((count+1)%10==0||count==0)console.log("arduino desconectado (tentativa "+(count+1)+")");   
                    count++;             
                })     
            }        
        }, 1000);
    }
})
const parser = sp.pipe(new Readline({
    delimiter: '\r\n'
}))

var newUserTo = null;
var ioInstance;
sp.on('open', function() {
    console.log('porta serial aberta');
});
sp.on('close', function() {
    console.log('->CLOSED<-');
    console.log(sp.isOpen);

    var count =0;
    var i =  setInterval(() => {        
        if (sp.isOpen){
            require('fs').appendFileSync('log_reconnect.txt', 'arduino reconectado '+new Date()+'\n');
            clearInterval(i)
            count=0;
        }   
        else{         
            sp.open((err)=>{
                if((count+1)%10==0||count==0)console.log("arduino desconectado (tentativa "+(count+1)+")");   
                count++;             
            })     
        }        
    }, 3000);
});


parser.on('data', function(rfid) {
    console.log('RFID lido:', rfid);
    module.exports.registrarEntradaSaidaRFID(rfid,true);
    });
parser.on('error', function(err) {
    console.log('Error: ', err);
})
 console.log('Conectando ao Arduino...');
   setTimeout(function worker() {
     console.log("reiniciando portas seriais...");
     spFora.close();
     spDentro.close();
     setTimeout(worker, 1000*60*60*6);
   }, 1000*60*60*6);
  /*
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
})*/
module.exports = function (io) {
    ioInstance = io;
    ioInstance.on('connection', socket => {
        socket.on('registrarRFID', (rfid) => {
            module.exports.registrarEntradaSaidaRFID(rfid, false);
        });
        socket.on('registrarRFIDentrada', (rfid) => {
            module.exports.registrarRFID(rfid, 'entrada', false);
        });
        socket.on('registrarRFIDsaida', (rfid) => {
            module.exports.registrarRFID(rfid, 'saida', false);
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

module.exports.registrarEntradaSaidaRFID=(rfid,serialwrite)=>{
    if(rfid==null){
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
    else{
    
    if (newUserTo!=null) {
		ioInstance.to(newUserTo).emit('novo RFID', rfid);
		newUserTo = null;
	}
        Usuario.findOne({
                rfid: rfid
            }, (err, u) => {
                if (err) {
                    if(serialwrite)sp.write('NOK!')
                    console.log('Erro find 1 ')
                } else {
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
                                if(serialwrite)sp.write('NOK!');
                                console.log('Erro registro 1')
                            } else if (r) {
                            //if(serialwrite)
                                //if(write!='NOK!')sp.write('(saida)'+write);
                                //else sp.write('NOK!');
                                var config = {
                                    status: 'warning',
                                    destroyByClick: true,
                                    duration: 20000,
                                    hasIcon: true,
                                    position: 'top-right',
                                }
                                ioInstance.emit('get usuarios no lab');
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

                                if(serialwrite)sp.write(write);
                                registro.save().then((registroCriado) => {
                                    var config = {
                                        status: (u && u.permissao != 'n') ? 'success' : 'danger',
                                        destroyByClick: true,
                                        duration: 20000,
                                        hasIcon: true,
                                        position: 'top-right',
                                    }

                                    ioInstance.emit('get usuarios no lab');
                                    ioInstance.emit('notificacao', {
                                        body: barrado + nome+'\n'+rfid,
                                        title: 'Entrada',
                                        config
                                    })
                                    console.log('Entrada registrada, ' + barrado + rfid + ', ' + nome, registroCriado.horaEntrada?registroCriado.horaEntrada:'',registroCriado.horaSaida?registroCriado.horaSaida:'')
                                }).catch(err => {
                                    //sp.write('NOK!');
                                    console.log('Erro registro 2', err)
                                });
                            }
                        });
                }

            });
            }
}