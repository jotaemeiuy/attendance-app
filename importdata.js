const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos SQLite
let db = new sqlite3.Database('./db/database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Función para importar datos
const importData = () => {
    fs.createReadStream('alumnos.csv') // Reemplaza con la ruta a tu archivo CSV
        .pipe(csv())
        .on('data', (row) => {
            const { name, surname, id_number } = row;
            // Insertar los datos en la tabla 'people'
            db.run(`INSERT INTO people (name, surname, id_number) VALUES (?, ?, ?)`, [name, surname, id_number], function (err) {
                if (err) {
                    console.error(err.message);
                }
            });
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            db.close();
        });
};

// Ejecutar la función
importData();
