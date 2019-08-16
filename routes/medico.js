var express = require('express');
var app = express();
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

app.get('/',( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({  })
    .skip(desde)
    .limit(5)
    .populate( 'usuario', 'nombre email' )
    .populate( 'hospital')
    .exec(
        ( err, medicos ) => {
            if( err ) {
                return res.status(200).json({
                    ok: false,
                    msj: 'Error cargando medicos',
                    errors: err
                });
            } 
            Medico.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                medicos: medicos,
                total: conteo
            });
        });
    });
});

app.post('/', mdAutenticacion.verificaToken,( req, res ) => {
    
    var body = req.body;
    console.log(body);
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario,
        hospital: body.hospital
    });

    medico.save( ( err, medicoGuardado ) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            // hospitalToken: req.hospital
        });
    });
});

app.put('/:id',mdAutenticacion.verificaToken,( req, res, next ) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar medico',
                errors: err
            });
        }
    
        if (!medico) {
            return res.status(400).json({
                ok: false,
                msj: 'El medico con el id '+ id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = body.usuario;
        medico.img = body.img;

        medico.save( (err, medicoGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    msj: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        })
    });
});

app.delete('/:id', mdAutenticacion.verificaToken ,( req, res ) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al borrar medico',
                errors: err
            });
        }

        if( !medicoBorrado ) {
            return res.status(500).json({
                ok: false,
                msj: 'No existe medico con ese id',
                errors: { message: 'No existe medico con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    })
});

module.exports = app;