const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mysql = require("mysql2");

const ipfs = ipfsClient.create({ host: 'localhost', port: '5001', protocol: 'http'});
const app = express();

//انشاء الاتصال بقاعدة البيانات
const db = mysql.createConnection({
    host:   'localhost',
    user:   'root',
    password:   '',
    database:   'project-ut'
});

//الإتصال بقاعدة البيانات
db.connect( (error) =>{
    if(error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
})
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/', (req, res) =>{
    res.render('addStudent');
});


app.post('/upload', (req,res) =>{
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/' + fileName;

    file.mv(filePath, async (err) =>{
        if(err){
            console.log('Error');
            return res.status(500).send(err);
        }

        const fileHash = await addFile(fileName, filePath);
        fs.unlink(filePath, (err) => {
            if (err) console.log(err);
        });

        res.render('upload', {fileName, fileHash});
    })
});

//التأكد من الوصول الى بيانات الفورم 
app.post('/addStudent' , (req,res) =>{
    const body = req.body;
    
    console.log(body);
    res.send("<h1>..تم إظافة الطالب</h1>");
});

const addFile = async (fileName, filePath) =>{
    const file = fs.readFileSync(filePath);
    const fileAdded = await ipfs.add({path: fileName, content: file});
    const fileHash = fileAdded.cid;

    return fileHash;
}

app.listen(3000, () =>{
    console.log("server listening to port 3000");
})