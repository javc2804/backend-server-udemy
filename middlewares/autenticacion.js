var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

exports.verificaToken = function (req, res, next) {
    // Verificar token 
    
    var token = req.query.token;
    jwt.verify( token, SEED, ( err, decoded ) => {
        if ( err ) {
            return res.status(401).json({
                ok: false,
                msj: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}