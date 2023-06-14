const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const post = require("./models/post")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, getDocs } = require('firebase-admin/firestore');

// Importa o arquivo de configuração do serviço Firebase Admin
const serviceAccount = require('./projeto-d29d3-firebase-adminsdk-583zz-e25bfcd12f.json');

// Inicializa o aplicativo Firebase Admin usando as credenciais do serviço
initializeApp({
    credential: cert(serviceAccount)
});

// Obtém uma instância do Firestore
const db = getFirestore();

const collectionRef = db.collection('cadastro');
const citiesRef = db.collection('cadastro');



app.engine("handlebars", handlebars({ defaultLayout: "main" }))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: false }))
app.set(bodyParser.json())

app.get("/", function (req, res) {
    res.render("primeira_pagina")
})

app.get("/consultar", function (req, res) {

    var i = 0;
    var data = {};
    collectionRef.get()
        .then(snapshot => {
            snapshot.forEach(doc => {

                // Cria uma referência para um documento em outra coleção usando o ID do documento atual
                const cityRef = db.collection('cadastro').doc(doc.id);

                // Obtém o documento usando a referência
                const unity = cityRef.get();

                // Acessa os dados do documento obtido
                cityRef.get().then(unity => {
                    if (unity && unity.exists) {
                        // Imprime o ID do documento e seus dados

                        data[i] = {
                            "id": doc.id,
                            "nome": unity.data().nome,
                            "telefone": unity.data().telefone,
                            "origem": unity.data().origem,
                            "data": unity.data().data,
                            "observacao": unity.data().observacao
                        }
                        i++;
                    }
                })
                    .catch(err => {
                        // Trata erros ao obter o documento
                        console.log(err);
                    });


            });


        })
        .catch(error => {
            // Trata erros ao obter os documentos da coleção
            console.error('Erro ao obter documentos:', error);
        });
    setTimeout(function () {
        console.log(data)
        res.render("consultar", { data })
    }, 5000);


})

app.get("/excluir/:id", function (req, res) {
    const docRef = db.collection('cadastro').doc(req.params.id);

    docRef.delete()
        .then(() => {
            console.log('Documento excluído com sucesso!');
            res.redirect("/consultar")
        })
        .catch(error => {
            console.error('Erro ao excluir documento:', error);
        });
})

app.get("/atualizar/:id", function (req, res) {

                // Cria uma referência para um documento em outra coleção usando o ID do documento atual
                const cityRef = db.collection('cadastro').doc(req.params.id);

                // Obtém o documento usando a referência
                const unity = cityRef.get();

                // Acessa os dados do documento obtido
                cityRef.get().then(unity => {
                    if (unity && unity.exists) {
                        // Imprime o ID do documento e seus dados

                        data = {
                            "id": req.params.id,
                            "nome": unity.data().nome,
                            "telefone": unity.data().telefone,
                            "origem": unity.data().origem,
                            "data": unity.data().data,
                            "observacao": unity.data().observacao
                        }
                    }
                })
                    .catch(err => {
                        // Trata erros ao obter o documento
                        console.log(err);
                    });


    setTimeout(function () {
        console.log(data)
        res.render("atualizar", { data })
    }, 5000);
    
})

app.post("/cadastrar", function (req, res) {
    citiesRef.doc().set({
        nome: req.body.nome, origem: req.body.origem, telefone: req.body.telefone,
        data: req.body.data, observacao: req.body.obs
    });
    res.redirect("/cadastrar")
})

app.post("/update", function (req, res) {
    const updates = {
        nome: req.body.nome, origem: req.body.origem, telefone: req.body.telefone,
        data: req.body.data, observacao: req.body.obs
      };
      
      const documentRef = db.collection('cadastro').doc(req.body.id);
      
      // Faça o update no documento
      documentRef.update(updates)
        .then(() => {
          res.redirect("/consultar")
          console.log('Documento atualizado com sucesso!');
          
        })
        .catch(error => {
          console.error('Erro ao atualizar documento:', error);
        });
})


app.listen(8081, function () {
    console.log("Servidor ativo! ")
})
