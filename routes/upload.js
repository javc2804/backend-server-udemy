var express = require('express');
var fileUpload = require('express-fileupload');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
var app = express();
var fs = require('fs');

app.use(fileUpload()); //middleware


app.put('/:tipo/:id', ( req, res, next ) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    // Tipos de colecciones

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if ( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            msj: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }
    
    if ( !req.files ) {
        return res.status(400).json({
            ok: false,
            msj: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo.

    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length -1 ]

    // Solo estas extenciones aceptamos.

    var extensionValidas = ['png', 'jpg', 'gif','jpeg'];

    if (extensionValidas.indexOf( extensionArchivo ) < 0) {
        return res.status(400).json({
            ok: false,
            msj: 'Extencion no valida',
            errors: { message: 'Las extenciones validas:'+ extensionValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado.


    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo al tmp al path

    var path = `./uploads/${ tipo }/${ nombreArchivo }`

    archivo.mv( path, err =>{
        if ( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo( tipo, id, nombreArchivo, res );
    });

});

function subirPorTipo( tipo, id, nombreArchivo, res ) {

    if ( tipo === 'usuarios' ) {
        Usuario.findById( id,(err, usuario)=>{

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msj: 'usuario no existe',
                });
            }

            var pathViejo = "./uploads/usuarios/" + usuario.img;
            // si existe, elimina el paht anterior.
            if ( fs.existsSync(pathViejo) ) {
                console.log( pathViejo );
                fs.unlink(pathViejo, (err)=>{
                    if (err) {
                        console.log("failed to delete local image:"+err);
                    }
                    else {
                        console.log('successfully deleted local image');                                
                    }
                });
            }
            usuario.img = nombreArchivo;
            usuario.save( ( err, usuarioActualizado ) => {
                usuarioActualizado.password = ':)'
               return res.status(200).json({
                    ok: true,
                    msj: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if ( tipo === 'medicos' ) {
        Medico.findById( id,(err, medico)=>{
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    msj: 'medico no existe',
                });
            }
            var pathViejo = "./uploads/medicos/" + medico.img;
            // si existe, elimina el paht anterior.
            if ( fs.existsSync(pathViejo) ) {
                console.log( pathViejo );
                fs.unlink(pathViejo, (err)=>{
                    if (err) {
                        console.log("failed to delete local image:"+err);
                    }
                    else {
                        console.log('successfully deleted local image');                                
                    }
                });
            }
            medico.img = nombreArchivo;
            medico.save( ( err, medicoActualizado ) => {
                medicoActualizado.password = ':)'
               return res.status(200).json({
                    ok: true,
                    msj: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }

    if ( tipo === 'hospitales' ) {
        Hospital.findById( id,(err, hospital)=>{
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    msj: 'hospital no existe',
                });
            }
            var pathViejo = "./uploads/hospitales/" + hospital.img;
            // si existe, elimina el paht anterior.
            if ( fs.existsSync(pathViejo) ) {
                console.log( pathViejo );
                fs.unlink(pathViejo, (err)=>{
                    if (err) {
                        console.log("failed to delete local image:"+err);
                    }
                    else {
                        console.log('successfully deleted local image');                                
                    }
                });
            }
            hospital.img = nombreArchivo;
            hospital.save( ( err,hospitalActualizado ) => {
                hospitalActualizado.password = ':)'
               return res.status(200).json({
                    ok: true,
                    msj: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }

}

module.exports = app;