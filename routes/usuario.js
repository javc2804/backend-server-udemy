var express = require('express');

var app = express();
var bcrypt = require('bcryptjs');
var Usuario = require('../models/usuario');

// Obtener todos los usuarios.

app.get('/', ( req, res, next ) => {
    Usuario.find({  }, 'nombre email img role') // se selecciona de las colecciones los campos menos el de la pwd.
    .exec(
        ( err, usuarios ) => {
            if( err ) {
                return res.status(200).json({
                    ok: false,
                    msj: 'Error cargando usuarios',
                    errors: err
                });
            } 
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
    });
});

//Actualizar usuario



app.put('/:id', (req, res) => {
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

// Crear nuevo usuario

app.post('/', ( req, res ) => {
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
            usuario: usuarioGuardado
        });
    });
})

// Borrar usuario

app.delete('/:id', ( req, res ) => {
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