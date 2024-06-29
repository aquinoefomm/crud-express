import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

// Database configuration. DB_PASSWORD to be set on environmental variables
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: DB_NAME,
    password: DB_PASSWORD,
    port: 5432,
});

const app = express();
const port = 3000;
const saltRounds = 10;

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

// Login page
app.get('/', (req, res) => {
    res.render('home.ejs', {});
});

app.get('/login', (req, res) => {
    res.render('login.ejs', {error: ""});
});

app.get('/signup', async (req, res) => {
    res.render('signup', {error: ""});
});

app.post('/login', async (req, res) => {
    const user = req.body.username;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE usuario = $1", [user, ]);
        console.log(result);
        if(result.rows.length > 0) {
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err){
                    console.log(err)
                } else if (hash == result.rows[0].password){
                    res.render("index.ejs", { user: "" })
                } else {
                    res.render("login.ejs", { error: "Invalid user or password" });
                }
            });
            
        } else {
            res.render('login.ejs', { error: "Invalid user or password"});
        }
    }catch(err){
        console.log(err);
    }

    res.render('index.ejs', {});
});

app.post('/signup', async (req, res) => {
    const user = req.body.username;
    const password = req.body.password;

    try {
        const checkForUser = await db.query("SELECT * FROM users WHERE usuario = $1", [user, ]);
        if (checkForUser.rows.length > 0){
            res.render('signup.ejs', {error: "User already exists"});
        } else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                } else {
                    const newUser = await db.query("INSERT INTO users (usuario, password) VALUES ($1, $2)", [user, hash]);
                }
            });
            res.render('login.ejs', { error: "" });
        }
    } catch (error){
        console.log(error);
    }
    
});

// Home page. Query to update records when home page is rendered. 
app.get('/index', (req, res) => {
//     db.query("SELECT * FROM college_courses", (err, res) => {
//     if (err) {
//         console.error("Error executing query", err.stack);
//     } else {
//         courses = res.rows;
//     }
// });
    res.render('index', {user: ""});
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
    let nome = req.body.nome.toUpperCase();
    let carga = req.body.carga;
    let professor = req.body.professor.toUpperCase();
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
    let nome = req.body.nome.toUpperCase();
    let carga = Number(req.body.carga);
    let professor = req.body.professor.toUpperCase();
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
