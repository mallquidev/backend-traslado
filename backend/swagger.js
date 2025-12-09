import swaggerAutogen from "swagger-autogen";

const outputFile = './swagger.json';
const endPointsFiles = ['./app.js'];

const doc = {
    info: {
        title: 'API DE PRUEBA',
        description: 'esta api es descripcion'
    },
    host: 'localhost:3000',
    schemes: ['http']
}

swaggerAutogen()(outputFile, endPointsFiles, doc);