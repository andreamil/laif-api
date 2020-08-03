// Configuration File
// Arquivo de configuração
module.exports = {
//  port: 8080,
 databaseURI: "mongodb://localhost/larm",
    port: process.env.PORT||4444,
    //databaseURI: "mongodb://"+process.env.DBNAME+":"+process.env.DBPASS+"@ds127644.mlab.com:27644/larm",
    // Secret to generate JWT(Json Web Token), you can put any value here Eg: '231312', 'minhaChave', '237283jh2j3h'.
    // Chave secreta para gerar o JWT(Json Web Token), você pode colocar qualquer coisa Ex: '231312', 'minhaChave', '237283jh2j3h'.
    secret: 'segredolarm0saddkmfoni0',
    // Time for authentication token expires
    // Tempo para o token de autenticação expirar
    tokenExpireTime: 604800, // 1 Semana // 1 Week
    // Tamanho mínimo da senha
    passwordMinLength: 4,
    // Here you can define the error messages' content
    // Aqui você pode definir o conteúdo das mensagens de erro
    msgs:{
        invalidEmail: "Email Invalido",
        invalidName: "Nome invalido",
        invalidPassword: "Senha invalida",
        // Mensagem que é retornada quando o tamanho da senha é pequeno
        weakPassword: `Minimo de 4 caracteres`,
        userCreated: "Usuario criado",
        userSaveFailed: "Erro ao salvar",
        // Mensagem que será retornada caso o e-mail que o usuário esteja tentando cadastrar já esteja em uso!
        userAleadyExists: "Email ja cadastrado",
        userNotExists: "Usuario nao existe",
        // Senha incorreta
        wrongPassword: "Senha incorreta"
    }

}
