const sqlite3 = require('sqlite3').verbose();

// Abre la base de datos SQLite
const db = new sqlite3.Database('./db/database.sqlite');

// Vaciar la tabla
const emptyTable = () => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM attendance', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

// Reiniciar el índice AUTOINCREMENT
const resetAutoincrement = () => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM sqlite_sequence WHERE name='attendance'", (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

// Ejecutar las operaciones
const resetTable = async () => {
    try {
        await emptyTable();
        await resetAutoincrement();
        console.log('Table cleared and AUTOINCREMENT reset.');
    } catch (error) {
        console.error('Error resetting table:', error);
    } finally {
        db.close();
    }
};

// Ejecutar el script
resetTable();
