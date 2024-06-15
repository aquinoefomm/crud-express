import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Database configuration. DB_PASSWORD to be set on environmental variables
const db = new pg.Client({
    user: USER_ID,
    host: "localhost",
    database: "it-career",
    password: USER_KEY,
    port: 5432,
});

const app = express();
const port = 3000;

// Conncetion to DB
db.connect();

// Query database to fetch records
let courses = {};
db.query("SELECT * FROM college_courses", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        courses = res.rows;
    }
});

// Middlewares 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Set engine
app.set('views', './views');
app.set('view engine', 'ejs');

// Home page. Query to update records when home page is rendered. 
app.get('/', (req, res) => {
  db.query("SELECT * FROM college_courses", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        courses = res.rows;
    }
});
    res.render('index', { name: "Éverton Peres" });
});

// Records page get.
app.get('/registros', (req, res) => {
    res.render('registros', { data: courses });
});

// Render form for creating new record.
app.get('/cadastro', (req, res) => {
    res.render('form-cadastro', { name: "Éverton Peres" });
});

// Create new record. Post from form with new info and include on DB.
app.post('/inserir', (req, res) => {
    let codigo = req.body.codigo;
    let nome = req.body.nome;
    let carga = req.body.carga;
    let professor = req.body.professor;
    console.log(codigo, nome, carga, professor)
    const values = [codigo, nome, carga, professor]
    db.query(`INSERT INTO college_courses(codigod, nomed, cargad, professor) VALUES($1,$2,$3,$4) ON CONFLICT(codigod) DO NOTHING`, values);
    db.query('COMMIT');
    res.redirect('/');
});

// Render form with data from selected record. 
app.post('/editar', (req, res) => {
    let codigod = req.body.codigod;
    let nomed = req.body.nomed;
    let cargad = req.body.cargad;
    let professord = req.body.professord;
    res.render('edit', { 
    codigo: codigod,
    nome: nomed,
    carga: cargad,
    professor: professord
  })
});

// Update record. Post from form with updated info and update on DB.
app.post('/update', async (req, res) => {
    let cod = Number(req.body.codigo);
    let nome = req.body.nome;
    let carga = Number(req.body.carga);
    let professor = req.body.professor;
    let values = [nome, carga, professor, cod]
    await db.query(`UPDATE college_courses SET nomed=$1, cargad=$2, professor=$3 WHERE codigod = $4`, values);
    db.query('COMMIT');
    res.redirect('/');
})

// Delete record.
app.post('/delete', (req, res) => {
  let cod = Number(req.body.codigod);
  db.query(`DELETE FROM college_courses WHERE codigod = ${cod}`);
  db.query('COMMIT');
  res.redirect('/');
})

// Start server.
app.listen(port, (req, res) => {
    console.log(`Server started on port ${port}`);
});

