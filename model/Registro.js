const mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema

const RegistroSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' },
    rfid: {type: String},
    tipo: {type: String },
    idDigital: { type: Number },
    horaEntrada: { type: Date },
    horaSaida: { type: Date, },
    invalido: {type: Boolean},
  });
  RegistroSchema.plugin(mongoosePaginate);
  var Registro = mongoose.model('Registro', RegistroSchema, 'registros');

  module.exports = { Registro }
