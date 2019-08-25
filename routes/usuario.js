var express = require('express');

var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');
var mdAutenticacion = require('../middlewares/autenticacion');
// Obtener todos los usuarios.

app.get('/', ( req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({  }, 'nombre email img role google') // se selecciona de las colecciones los campos menos el de la pwd.
    .skip(desde)
    .limit(5)
    .exec(
        ( err, usuarios ) => {
            if( err ) {
                return res.status(200).json({
                    ok: false,
                    msj: 'Error cargando usuarios',
                    errors: err
                });
            } 

        Usuario.count({}, (err, conteo) =>{
            res.status(200).json({
                ok: true,
                usuarios: usuarios,
                total: conteo
            });
        });
    });
});

// Crear nuevo usuario

app.post('/' ,( req, res ) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        rol: body.rol
    });

    

    usuario.save( ( err, usuarioGuardado ) => {

        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });
})


//Actualizar usuario

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_o_MismoUsuario] , (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar usuario',
                errors: err
            });
        }
    
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msj: 'El usuario con el id '+ id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if ( err ) {
                return res.status(400).json({
                    ok: false,
                    msj: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)'

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        })

    });
});

// Borrar usuario

app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaADMIN_ROLE] ,( req, res ) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al borrar usuario',
                errors: err
            });
        }

        if( !usuarioBorrado ) {
            return res.status(500).json({
                ok: false,
                msj: 'No existe usuario con ese id',
                errors: { message: 'No existe usuario con ese id'}
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
});

module.exports = app;