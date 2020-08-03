const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const config = require("../config");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { ObjectID } = require('mongodb');
const { auth_middleware, permitir } = require('../middleware');

// Loading User Model
// Carregando Model de usuário
    require('../model/Usuario');
    const Usuario = mongoose.model('Usuario');

// Router
    /*
        Register Route:
        The goal of this route, is create new users.
        It receives three parameters: Name, Password and Email, if one of those is null, the API Will return a json with error message

        Rota register:
        O Objetivo desta routa é criar novos usuários
        Ela recebe três parâmetros: Nome, senha e email, se um deles for nulo a API Vai retornar um json com um mensagem de erro
    */
    router.post('/register', auth_middleware, permitir('admin','professor'), (req, res) => {
        // Server-side Verification
            // Validating E-mail
            // Validando E-mail
                if(!req.body.email || req.body.email == null || typeof req.body.email == undefined){
                    return res.json({success: false, msg: config.msgs.invalidEmail});
                }
            // Validating name
            // Validando nome
                if(!req.body.fullName || req.body.fullName == null || typeof req.body.fullName == undefined){
                    return res.json({success: false, msg: config.msgs.invalidName});
                }
            // Validating password
            // Validando senha
                if(!req.body.password || req.body.password == null || typeof req.body.password == undefined){
                    return res.json({success: false, msg: config.msgs.invalidPassword});
                }
                // Validating password's size
                // Validando o tamanho da senha
                    if(req.body.password.length < config.passwordMinLength){
                        return res.json({success: false, msg: config.msgs.weakPassword});
                    }
            // Creating user:
            // Criando usuário:
                    const newUser = {
                        fullName: req.body.fullName,
                        email: req.body.email,
                        password: req.body.password,
                        role: req.body.role
                    }
                    // Checking if user already exists in database
                    // Checando se o usuário já existe no banco de dados
                    Usuario.findOne({email: newUser.email}).then((user) => {
                            if(user){
                                return res.json({success: false, msg: config.msgs.userAleadyExists});
                            }else{
                                // Hashing password
                                // 'Hasheando' a senha
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                                        if(err){
                                            res.sendStatus(403);
                                        }
                                        newUser.password = hash;
                                        var user = new Usuario(newUser);
                                        user.save().then(() => {
                                          return jwt.sign({ _id: user._id.toHexString(), role: user.role,fullName:user.fullName }, config.secret);
                                        }).then((token) => {
                                            res.json({success: true, msg: config.msgs.userCreated, user: newUser, data: { token }});
                                        }).catch(err => {
                                            res.json({success: false, msg: config.msgs.userSaveFailed,err: err});
                                        })
                                    })
                                })
                            }
                        }).catch(err => {
                            res.sendStatus(403)
                        })
    });
    router.post('/criar', auth_middleware, (req, res) => {
                    if(!req.decoded.role.includes('admin')&&req.decoded._id!=req.body._id){
                      return res.status(403).json({message: "Forbidden"});
                    }
                    var newUser = {};
                    
                        req.body.fullName&&(newUser.fullName= req.body.fullName)
                        req.body.email&&(newUser.email= req.body.email)
                        req.body.password&&(newUser.password= bcrypt.hashSync(req.body.password, 10))
                        req.body.dataDeNascimento&&(newUser.dataDeNascimento= req.body.dataDeNascimento)
                        req.body.role&&(newUser.role= req.body.role)
                        req.body.matricula&&(newUser.matricula=req.body.matricula)
                        req.body.profResponsavel&&(newUser.profResponsavel=req.body.profResponsavel)
                        req.body.siape&&(newUser.siape=req.body.siape)
                        req.body.rfid&&(newUser.rfid=req.body.rfid)
                        req.body.permissao&&(newUser.permissao=req.body.permissao)

                    if(req.body._id){

                        if(req.body.password&&(req.body.password.length < config.passwordMinLength)){
                            return res.json({success: false, msg: config.msgs.weakPassword});
                        }
                        var fotoid;
                        if(req.body.foto&&req.body.foto.startsWith('data')){
                            fotoid = salvarFoto(req.body.foto,req.body._id);
                            if(fotoid)newUser.foto=fotoid;
                        }  
                        Usuario.findByIdAndUpdate(req.body._id,newUser,{new:true},(err,userUpd)=>{
						    if(err)return res.json({success: false, msg: 'falha ao editar usuario'+msg,err: err});
						    userUpd.password=undefined;
						    if(req.decoded._id==userUpd._id){
                                return res.json({
                                success: true, 
                                msg: 'Usuario editado com sucesso (token recebido)'+' '+userUpd.foto, 
                                user: userUpd,
                                token:jwt.sign({ 
						            _id: userUpd._id.toHexString(), 
						            role: userUpd.role,
						            fullName:userUpd.fullName,
						            dataDeNascimento:userUpd.dataDeNascimento,
						            matricula:userUpd.matricula,
						            siape:userUpd.siape,
						            foto:userUpd.foto,
						            rfid:userUpd.rfid,
						            email:userUpd.email,
						            permissao:userUpd.permissao
					            }, config.secret)});						        
						    }
                            return res.json({success: true, msg: 'Usuario editado com sucesso', user: userUpd});
                        })   
                    }
                    else{
                        if(!req.body.email || req.body.email == null || typeof req.body.email == undefined){
                            return res.json({success: false, msg: config.msgs.invalidEmail});
                        }
                        if(!req.body.fullName || req.body.fullName == null || typeof req.body.fullName == undefined){
                            return res.json({success: false, msg: config.msgs.invalidName});
                        }
                        if(!req.body.password || req.body.password == null || typeof req.body.password == undefined){
                            return res.json({success: false, msg: config.msgs.invalidPassword});
                        }
                        if(req.body.password.length < config.passwordMinLength){
                            return res.json({success: false, msg: config.msgs.weakPassword});
                        }
                        Usuario.findOne({email: newUser.email}).then((user) => {
                            if(user){
                                return res.json({success: false, msg: config.msgs.userAleadyExists});
                            }else{
                                // Hashing password
                                // 'Hasheando' a senha
                                bcrypt.genSalt(10, (err, salt) => {
                                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                                        if(err){
                                            return res.sendStatus(403);
                                        }
                                        newUser.password = hash;
                                        var fotoid;
                                        if(req.body.foto){
                                            fotoid=salvarFoto(req.body.foto,savedUser._id);
                                            newUser.foto=fotoid;
                                        }
                                        var user = new Usuario(newUser);
                                        user.save().then(() => {
                                            
						                    console.log(user);
						                    user.password=undefined;
                                            return res.json({success: true, msg: config.msgs.userCreated, user: user});
                                        }).catch(err => {
                                            return res.json({success: false, msg: config.msgs.userSaveFailed,err: err});
                                        })
                                    })
                                })
                            }
                        }).catch(err => {
                            return res.sendStatus(403)
                        })
                        }
    });
    function salvarFoto(foto,id){
       var base64Data = foto.split(',')[1];
       try{
        
        const fotoid = crypto.randomBytes(8).toString("hex");
        require("fs").writeFileSync("/home/larm/larm-api/fotosPerfil/"+id+"."+fotoid+".png", base64Data, 'base64');
        return fotoid;
       }
       catch {
        return false;
       }
    
    }
  //router.post('/authenticate', (req, res) => {
    router.post('/refresh-token',auth_middleware,(req, res) => {
            
            Usuario.findById(req.decoded._id, (err, user) => {
                var token = jwt.sign({ 
						_id: user._id.toHexString(), 
						role: user.role,
						fullName:user.fullName,
						dataDeNascimento:user.dataDeNascimento,
						matricula:user.matricula,
						siape:user.siape,
						foto:user.foto,
						rfid:user.rfid,
						email:user.email,
						permissao:user.permissao
					}, config.secret);
                  console.log('usuario: '+user.fullName+', ação: refresh-token');
                  return res.json({ success: true, msg: 'Successfully authenticated', data: { token } });

              }).catch(err => {
                 return res.status(401).json({ success: true, msg: 'Erro refresh-token',err });
              })
    });
    const crypto = require("crypto");

    router.post('/login',(req, res) => {
        // Server-side Verification
            // Validating E-mail
            // Validando E-mail
            if(!req.body.email || req.body.email == null || typeof req.body.email == undefined){
                return res.json({success: false, msg: config.msgs.invalidEmail});
            }

        // Validating password
        // Validando senha
            if(!req.body.password || req.body.password == null || typeof req.body.password == undefined){
                return res.json({success: false, msg: config.msgs.invalidPassword});
            }
            Usuario.findOne({$or:[{email: req.body.email},{matricula: req.body.email},{siape: req.body.email}]}).then((user) => {
              if (!user) {
                return res.status(401).json({ msg: 'Email incorreto' });
              }
                if(user.password==undefined){
                    user.password = bcrypt.hashSync(user.matricula, bcrypt.genSaltSync(10));
                    user.save();
                }
                if(user.role==undefined||user.role.length==0){
                    if(user.grau=='GRADUACAO')user.role.push('aluno');
                    if(user.grau=='DOUTORADO')user.role.push('professor');
                    user.save();
                }
              console.log(user.role);
                // Use bcrypt.compare to compare password and user.password
                bcrypt.compare(req.body.password, user.password, (err, resS) => {
                  if (resS) {
                  console.log(resS);
                    var token = jwt.sign({ 
						_id: user._id.toHexString(), 
						role: user.role,
						fullName:user.fullName,
						dataDeNascimento:user.dataDeNascimento,
						matricula:user.matricula,
						siape:user.siape,
						foto:user.foto,
						rfid:user.rfid,
						email:user.email,
						permissao:user.permissao
					}, config.secret);//.then((token) => {
                  console.log('usuario: '+user.fullName+', ação: login, authenticate');
                  return res.json({ success: true, msg: 'Autenticado com sucesso', data: { token } });
                  } else {
                   return res.status(401).json({ msg: 'Senha incorreta' });
                  }
                });
            });
    });
        router.get('/professores', auth_middleware, (req, res, next) =>  {
        Usuario.find({role:'professor'}, { password: 0, tokens: 0,createdDate:0}).then((usuarios)=>{
            return res.json({success: true, msg: 'Successfully getted the professores', usuarios});
        }).catch(err => {
            return res.json({success: false, msg: 'Erro get user',err: err})
        })
        
        });
        router.get('/user', auth_middleware, (req, res, next) =>  {
        Usuario.find({}, { password: 0, tokens: 0,createdDate:0}).sort({fullName:1}).then((usuarios)=>{
            return res.json({success: true, msg: 'Successfully getted the users', usuarios});
        }).catch(err => {
            return res.json({success: false, msg: 'Erro get user',err: err})
        })
        
        });

         router.get('/user/:id', auth_middleware,  (req, res, next) =>  {
           const id = req.params.id;

           if (!ObjectID.isValid(id)) {
              return res.json({success: false, msg: 'ObjectID invalido',user:{}});
           }

           Usuario.findById(id,'-password -tokens -createdDate').then((user)=>{
              return res.json({success: true, msg: 'Successfully getted the user', user});
           }).catch(err => {
              return res.json({success: false, msg: 'Erro get user por id',err: err});
           })
         })
         router.get('/eu', auth_middleware,  (req, res, next) =>  {
           const id = req.decoded._id;

           Usuario.findById(id,'-password -tokens -createdDate').then((user)=>{
              return res.json({success: true, msg: 'Successfully getted eu', user});
           }).catch(err => {
              return res.json({success: false, msg: 'Erro get user por id',err: err});
           })
         })
         router.delete('/excluir/:id', auth_middleware,permitir('admin'),  (req, res, next) =>  {           
           Usuario.findByIdAndRemove(req.params.id, (err, tasks) => {
            if (err) return res.json({success: false, msg: 'Erro remove user por id',err: err});
            return res.json({success: true, msg: 'Usuario removido com sucesso'});
        });
         })



module.exports = router;
