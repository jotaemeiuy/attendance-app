const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

//Configuracion de Express
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));

// Conexión a la base de datos
let db = new sqlite3.Database('./db/database.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado.');
});


// Crear tablas si no existen
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        id_number TEXT UNIQUE NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_number TEXT NOT NULL,
        date TEXT NOT NULL,
        attended INTEGER DEFAULT 0,
        FOREIGN KEY(id_number) REFERENCES people(id_number)
    )`);
});

// Ruta para la página principal
app.get('/', (req, res) => {
    db.all("SELECT id, name, surname, id_number FROM people", [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('index', { people: rows });
    });
});

// Ruta para registrar asistencia
app.post('/attendance', (req, res) => {
    const { id_number } = req.body;

    // Obtener fecha actual del servidor
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Montevideo' });

    // Verificar si ya se registró asistencia hoy
    db.get(`SELECT * FROM attendance WHERE id_number = ? AND date = ?`, [id_number, date], (err, row) => {
        if (err) {
            throw err;
        }
        if (row) {
            return res.send("Ya has registrado asistencia hoy.");
        }

        // Insertar nuevo registro de asistencia
        db.run(`INSERT INTO attendance (id_number, date, attended) VALUES (?, ?, 1)`, [id_number, date], function (err) {
            if (err) {
                throw err;
            }
            res.redirect('/');
        });
    });
});


app.get('/details', (req, res) => {
    const id_number = req.query.id_number_search || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    db.all(`SELECT date, attended FROM attendance WHERE id_number = ? ORDER BY date DESC LIMIT ? OFFSET ?`, [id_number, limit, offset], (err, rows) => {
        if (err) {
            throw err;
        }

        // Convertir fechas al formato MM/DD/YYYY
        const formattedRows = rows.map(row => {
            const [year, month, day] = row.date.split('-');
            const formattedDate = `${month}/${day}/${year}`;
            return { ...row, date: formattedDate };
        });

        db.get(`SELECT COUNT(*) AS total FROM attendance WHERE id_number = ?`, [id_number], (err, countRow) => {
            if (err) {
                throw err;
            }
            const total = countRow.total;
            const totalPages = Math.ceil(total / limit);

            res.render('details', { attendance: formattedRows, currentPage: page, totalPages: totalPages, id_number: id_number });
        });
    });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
