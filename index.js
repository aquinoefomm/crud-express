import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "it-career",
    password: "you-password",
    port: 5432,
});

const app = express();
const port = 3000;

db.connect();

let courses = {};
db.query("SELECT * FROM college_courses", (err, res) => {
    if (err) {
        console.error("Error executing query", err.stack);
    } else {
        courses = res.rows;
    }

});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set('views', './views');
app.set('view engine', 'ejs');

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

app.get('/registros', (req, res) => {
    res.render('registros', { data: courses });
});

app.get('/cadastro', (req, res) => {
    res.render('form-cadastro', { name: "Éverton Peres" });
});

app.post('/inserir', async (req, res) => {
    let codigo = req.body.codigo;
    let nome = req.body.nome;
    let carga = req.body.carga;
    let professor = req.body.professor;
    console.log(codigo, nome, carga, professor)
    const values = [codigo, nome, carga, professor]
    await db.query(`INSERT INTO college_courses(codigod, nomed, cargad, professor) VALUES($1,$2,$3,$4) ON CONFLICT(codigod) DO NOTHING`, values);
    db.query('COMMIT');
    res.redirect('/');
});

app.post('/editar', async (req, res) => {
    let codigod = req.body.codigod;
    let nomed = req.body.nomed;
    let cargad = req.body.cargad;
    let professord = req.body.professord;
  await res.render('edit', { 
    codigo: codigod,
    nome: nomed,
    carga: cargad,
    professor: professord
  })
});

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

app.post('/delete', (req, res) => {
  let cod = Number(req.body.codigod);
  db.query(`DELETE FROM college_courses WHERE codigod = ${cod}`);
  db.query('COMMIT');
  res.redirect('/');
})

app.post('/editar', (req, res) => {
  res.redirect('/');
})

app.listen(port, (req, res) => {
    console.log(`Server started on port ${port}`);
});

