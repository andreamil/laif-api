const mongoose = require('mongoose');
const Schema = mongoose.Schema


const ProjetoSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    status: { type: String, },
    categoria: { type: String, },
    lider: { type: Schema.Types.ObjectId, ref: 'Usuario'  },
    integrantes: [{ type : Schema.Types.ObjectId, ref: 'Usuario' }],
    vigencia: { type: String },
    descricao: { type: String, required: true },
    createdDate: { type: Date, default: new Date() }
  });

  var Projeto = mongoose.model('Projeto', ProjetoSchema, 'projetos');

  module.exports = { Projeto }
