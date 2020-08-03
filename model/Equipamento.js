const mongoose = require('mongoose');
const Schema = mongoose.Schema


const EquipamentoSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    marca: { type: String, },
    num_serie: { type: String, },
    codBarra: { type: String },
    createdDate: { type: Date, default: new Date() }
  });

  var Equipamento = mongoose.model('Equipamento', EquipamentoSchema, 'equipamentos');

  module.exports = { Equipamento }
