const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth_middleware, permitir } = require('../middleware');
require('../model/Registro');
var Registro = mongoose.model('Registro');



router.post('/entrada', auth_middleware, permitir('admin'), (req, res) => {
    if (!req.body.id || req.body.id == null || typeof req.body.id == undefined) {
        res.json({ success: false, msg: 'Api ok, Id necessário' });
    }
    else
        //caso ja exista entrada sem saída, invalida a anterior antes de registrar uma nova
        Registro.findOneAndUpdate({ usuario: req.body.id, horaSaida: null, $or: [{ invalido: null }, { invalido: false }], tipo: 'web' },
            { $set: { invalido: true } },
            { new: true },
            (err, r) => {
                if (err) res.json({ success: false, msg: 'Erro ao registrar entrada, ' + err, err: err });
                else {
                    const newRegistro = {
                        usuario: req.body.id,
                        tipo: 'web',
                        horaEntrada: new Date()
                    }
                    var registro = new Registro(newRegistro);
                    registro.save().then((registroCriado) => {
                        res.json({ success: true, msg: 'Entrada registrada' + (r ? ' (entrada anterior invalidada), ' : ', ') + registroCriado, registro: registroCriado });
                    }).catch(err => {
                        res.json({ success: false, msg: 'Erro ao registrar entrada, ' + err, err: err });
                    });
                }
            });

});

router.post('/saida', auth_middleware, permitir('admin'), (req, res) => {
    if (!req.body.id || req.body.id == null || typeof req.body.id == undefined) {
        res.json({ success: false, msg: 'Api ok, Id necessário' });
    }
    //procura entrada para adicionar saida, se não houver apenas registra uma saída invalidada
    else
        Registro.findOneAndUpdate(
            { usuario: req.body.id, horaSaida: null, $or: [{ invalido: null }, { invalido: false }], tipo: 'web' },
            { $set: { horaSaida: new Date() } },
            { new: true },
            (err, registro) => {
                if (err)
                    res.json({ success: false, msg: 'Erro ao registrar saída, ' + err, err: err });
                else if (registro)
                    res.json({ success: true, msg: 'Saída registrada, ' + registro });
                else {
                    const newRegistro = {
                        usuario: req.body.id,
                        tipo: 'web',
                        horaSaida: new Date(),
                        invalido: true
                    }
                    var registro = new Registro(newRegistro);
                    registro.save().then((registroCriado) => {
                        res.json({ success: true, msg: 'Saída registrada (inválida pois entrada não encontrada)' + registroCriado, registro: registroCriado });
                    }).catch(err => {
                        res.json({ success: false, msg: 'Erro ao registrar saída, ' + err, err: err });
                    });

                }
            });

});
router.get('/relatorio/porta/rfid/:rfid', auth_middleware, permitir('admin'), (req, res) => {
    if (!req.params.rfid || req.params.rfid == null || typeof req.params.rfid == undefined) {
        res.json({ success: false, msg: 'Api ok, rfid necessário' });
    }
    else Registro.find({ rfid: req.params.rfid/*, $or:[{invalido: null},{invalido: false}]*/ }, { horaEntrada: 1, horaSaida: 1 },
        (err, registros) => {
            if (err)
                res.json({ success: false, msg: 'Erro get registros porta, ' + err, err: err });
            else
                res.json({ success: true, msg: 'Sucesso get registros porta', rfid: req.params.rfid, registros });
        });
});
router.get('/relatorio/porta/id/:id', auth_middleware, (req, res) => {
    if(!req.decoded.role.includes('admin')&&req.decoded._id!=req.body._id){
        return res.status(403).json({message: "Forbidden"});
      }
    var query = { usuario:req.params.id };
    //if(req.query.usuario_like){
    //    
    //    query.usuario.fullName=new RegExp(`${req.query.usuario_like}`,'i');
    //};
    var options = {
         select: 'horaEntrada horaSaida',
        sort: {
            horaEntrada: req.query._order ? req.query._order == 'ASC' ? 1 : -1 : -1,
            horaSaida: req.query._order ? req.query._order == 'ASC' ? 1 : -1 : -1
        },
        lean: true,
        leanWithId: false,
        offset: (req.query._page - 1) * req.query._limit,
        limit: parseInt(req.query._limit)
    };
    console.log(query);
    Registro.paginate(query, options).then(
        //Registro.find({ $or:[{invalido: null},{invalido: false}], tipo: 'porta'},{horaEntrada: 1, horaSaida: 1}).populate('usuario',{password:0}).then(
        (result) => {
            if (result) {
                let count = 0, i;
                if (req.query._mode == 'recente') {
                    for (i = 0; i < result.docs.length; i++) {
                        if (count >= 10) {
                            break;
                        }
                        if (result.docs[i].horaEntrada) count++;
                        if (result.docs[i].horaSaida) count++;
                    }
                    console.log(i, count)
                    res.json({ success: true, msg: 'Sucesso get registros porta', registros: result.docs.slice(0, i), total: i });
                } else res.json({ success: true, msg: 'Sucesso get registros porta', registros: result.docs, total: result.total });
            }
        }).catch((err) => { console.log(err); res.json({ success: false, msg: 'Erro get registros porta, ' + err, err: err }) });
});
router.get('/relatorio/porta/', auth_middleware, permitir('admin'), (req, res) => {
    // var query = { $or: [{ invalido: null }, { invalido: false }], "usuario.fullName": new RegExp(`${req.query.usuario_like}`,'i') };
    // //if(req.query.usuario_like){
    // //    
    // //    query.usuario.fullName=new RegExp(`${req.query.usuario_like}`,'i');
    // //};
    // var options = {
    //     populate: 'usuario',
    //     select: '-usuario.password',
    //     sort: {},
    //     lean: true,
    //     offset: (req.query._page - 1) * req.query._limit,
    //     limit: parseInt(req.query._limit)
    // };
    // req.query._order && (options.sort[req.query._sort] = req.query._order == 'ASC' ? 1 : -1);
    //console.log(req.query,(req.query._page - 1) * req.query._limit);
    if(!req.query._page)req.query._page=1;
    if(!req.query._limit)req.query._limit=10;
    if(!req.query.usuario_like)req.query.usuario_like='';
    let intervaloEntrada=[],intervaloSaida=[],pipelines=[];
    if(req.query.horaEntrada_like){
        intervaloEntrada=req.query.horaEntrada_like.split(',');
        intervaloEntrada[0]=new Date(parseInt(intervaloEntrada[0]))
        intervaloEntrada[1]=new Date(parseInt(intervaloEntrada[1]))
        pipelines.push({$match :  {horaEntrada: {$gte: intervaloEntrada[0], $lte: intervaloEntrada[1]}}});
    }
    if(req.query.horaSaida_like){
        intervaloSaida=req.query.horaSaida_like.split(',');
        intervaloSaida[0]=new Date(parseInt(intervaloSaida[0]))
        intervaloSaida[1]=new Date(parseInt(intervaloSaida[1]))
        pipelines.push({$match :  {horaSaida: {$gte: intervaloSaida[0], $lte: intervaloSaida[1]}}});
    }
    pipelines.push(
        { $match: { $or: [{ invalido: null }, { invalido: false }]} },
        { $lookup: 
          { from: "usuarios",
            localField: "usuario",
            foreignField: "_id",
            as: "usuario"
          }
        },
        { $unwind: "$usuario"},
        { $match : { "usuario.fullName": new RegExp(`${req.query.usuario_like}`,'i') }},
        { $sort : { 
            horaEntrada: req.query._sort=='horaEntrada'?req.query._order ? req.query._order == 'ASC' ? 1 : -1 : -1:1,
            horaSaida: req.query._sort=='horaSaida'?req.query._order ? req.query._order == 'ASC' ? 1 : -1 : -1:1}},
        { $project: { "usuario.password":0 } },
        { $facet: {
            docs: [{ $skip: (req.query._page - 1) * req.query._limit }, { $limit: parseInt(req.query._limit) }],
            totalCount: [
              { $count: 'total' }
            ]
          }
        }
     );
     console.log(pipelines);
     
    Registro.aggregate(pipelines).then(
        //Registro.find({ $or:[{invalido: null},{invalido: false}], tipo: 'porta'},{horaEntrada: 1, horaSaida: 1}).populate('usuario',{password:0}).then(
        (result) => {
            //console.log(result)
            if (result) res.json({ success: true, msg: 'Sucesso get registros porta', registros: result[0].docs, total: result[0].totalCount[0]?result[0].totalCount[0].total:0 });
        }).catch((err) => { console.log(err); res.json({ success: false, msg: 'Erro get registros porta, ' + err, err: err }) });
});

router.get('/relatorio/porta/agora', auth_middleware, (req, res) => {
    Registro.find({ $or: [{ invalido: null }, { invalido: false }], horaSaida: null ,tipo:'porta'}, { usuario: 1, horaEntrada: 1, rfid: 1 })
        .populate('usuario', { password: 0 }).then(
            (registros) => {
                res.json({ success: true, msg: 'Sucesso get registros porta agora', registros });
            }).catch((err) => res.json({ success: false, msg: 'Erro get registros porta agora, ' + err, err: err }));
});
router.get('/relatorio/porta/hoje', auth_middleware, (req, res) => {
    Registro.find({ $or: [{ invalido: null }, { invalido: false }],$or:[{horaEntrada: {$gte: new Date(new Date().setHours(-24))}},{horaSaida: {$gte: new Date(new Date().setHours(-24))}},{horaSaida: {$exists: false}}]}, { usuario: 1, horaEntrada: 1, horaSaida: 1 })
        .populate('usuario', { password: 0 }).then(
            (registros) => {
                res.json({ success: true, msg: 'Sucesso get registros porta agora', registros:registros.filter((i)=>i.usuario) });
            }).catch((err) => res.json({ success: false, msg: 'Erro get registros porta agora, ' + err, err: err }));
});

module.exports = router;
