var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// Fin Google

var app = express();

var Usuario = require('../models/usuario');

// Autenticacion mediante google.
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
  }

var mdAutenticacion = require ('../middlewares/autenticacion');

app.get('/renuevatoken' ,mdAutenticacion.verificaToken, ( req, res ) => {
    var token = jwt.sign({ usuario: req.usuario }, SEED,{ expiresIn: 14400 }) // cuatro horas
    return res.status(200).json({
        ok: true,
        token
    });
})

app.post('/google', async (req, res) => {
    var token = req.body.token;

    var googleUser = await verify( token )
        .catch(e => {
            return res.status(403).json({
                ok: false,
                msj: 'token no valido.',
            });
        });

    Usuario.findOne( { email: googleUser.email }, ( err, usuarioBD)=> {
        if( err ) {
            return res.status(500).json({
                ok: false,
                msj: 'Error al buscar usuarios',
                errors: err
            });
        }

        if ( usuarioBD ) {
            if ( usuarioBD.google === false ) {
                return res.status(200).json({
                    ok: false,
                    mensaje: "debe autentificarse normal",
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400 }) // cuatro horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    menu: obtenerMenu( usuarioBD.role )
                });
            }
        } else {
            // El usuario no existe, hay que crearlo.
            var usuario = new Usuario();
            usuario.name = googleUser.name;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save(( err, usuarioBD ) =>{

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensaje: 'Error al crear usuario - google',
                        errors: err
                    });
                }

                var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400 }) // cuatro horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu( usuario.role )
                });
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     googleUser: googleUser,
    // });
});


//Autenticacion normal


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
                msj: 'Credenciales incorrectos',
                errors: err
            });
        }
        
        if ( !bcrypt.compareSync(body.password, usuarioBD.password) ) {
            return res.status(400).json({
                ok: false,
                msj: 'Credenciales incorrectos',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400 }) // cuatro horas

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id,
            menu: obtenerMenu( usuarioBD.role )
        });
    });
});

function obtenerMenu ( ROLE ) {
    var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            {titulo: 'Dashboard', url: '/dashboard'},
            {titulo: 'ProgressBar', url: '/progress'},
            {titulo: 'Graficas', url: '/graficas1'},
            {titulo: 'promesas', url: '/promesas'},
            {titulo: 'rxjs', url: '/rxjs'}
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // { titulo: 'Usuarios', url:'/usuarios' },
            { titulo: 'Hospitales', url:'/hospitales' },
            { titulo: 'Medicos', url:'/medicos' },
          ]
        }
      ];

      console.log(ROLE);

      if ( ROLE === 'ADMIN_ROLE' ) {
        menu[1].submenu.unshift( { titulo: 'Usuarios', url:'/usuarios' } )
      }
    return menu;
}

module.exports = app;