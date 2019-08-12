var express = require('express');

var app = express();

app.get('/', ( req, res, next ) => {
    console.log(res);
    res.status(200).json({
        ok: true,
        msj: 'Peticion realizada correctamente'
    });
});

module.exports = app;