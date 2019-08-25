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

//verificar admin

exports.verificaADMIN_ROLE = function (req, res, next) {
    // Verificar token 
    var usuario = req.usuario;
    if ( usuario.role === 'ADMIN_ROLE' ) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            msj: 'Token incorrecto - No es administrador',
            errors: { message: 'no es administrador, no puede hacer eso' }
        });
    }
}

// Verifica mismo usuario

exports.verificaADMIN_o_MismoUsuario = function (req, res, next) {
    // Verificar token 
    var usuario = req.usuario;
    var id = req.params.id;
    if ( usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            msj: 'Token incorrecto - No es administrador, ni es el mismo usuario.',
            errors: { message: 'no es administrador, no puede hacer eso' }
        });
    }
}