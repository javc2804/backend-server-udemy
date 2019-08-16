var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middlewares/autenticacion');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED

app.get('/',( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({  }, 'nombre img usuario')
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec(
        ( err, hospitales ) => {
            if( err ) {
                return res.status(200).json({
                    ok: false,
                    msj: 'Error cargando hospitales',
                    errors: err
                });
            } 
            
        Hospital.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                hospitales: hospitales,
                total: conteo
            });
        });
    });
});

app.post('/', mdAutenticacion.verificaToken,( req, res ) => {
    
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
    });

    hospital.save( ( err, hospitalGuardado ) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            // hospitalToken: req.hospital
        });
    });
});

app.put('/:id',mdAutenticacion.verificaToken,( req, res, next ) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar hospital',
                errors: err
            });
        }
    
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                msj: 'El hospital con el id '+ id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    msj: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        })

    });
});

app.delete('/:id', mdAutenticacion.verificaToken ,( req, res ) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al borrar hospital',
                errors: err
            });
        }

        if( !hospitalBorrado ) {
            return res.status(500).json({
                ok: false,
                msj: 'No existe hospital con ese id',
                errors: { message: 'No existe hospital con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    })
});

module.exports = app;