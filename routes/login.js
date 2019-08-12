var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req, res)=>{

    var body = req.body;

    Usuario.findOne({ email: body.email }, ( err , usuarioBD)=>{

        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msj: 'Credenciales incorrectos -- email',
                errors: err
            });
        }
        
        if ( !bcrypt.compareSync(body.password, usuarioBD.password) ) {
            return res.status(400).json({
                ok: false,
                msj: 'Credenciales incorrectos -- password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, 'este-es-un-seed-dificil',{ expiresIn: 14400 }) // cuatro horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id
        });
    });
});

module.exports = app;