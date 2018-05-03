var express = require('express')
var router = express.Router()

const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;
const endpoint = 'http://epl.di.uminho.pt:40003/repositories/M51-CLAV'
const myupdateEndpoint = 'http://epl.di.uminho.pt:40003/repositories/M51-CLAV/statements'

var client = new SparqlClient( endpoint, {updateEndpoint: myupdateEndpoint, 
                                          defaultParameters: {format: 'json'}})
        .register({
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            clav: 'http://jcr.di.uminho.pt/m51-clav#',
            owl: 'http://www.w3.org/2002/07/owl#',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            noInferences: 'http://www.ontotext.com/explicit'
        })

// ------------------Tratamento dos pedidos--------------
/* GET: responde com a página de uma entidade qualquer. */
router.get('/:id', (req, res,next)=>{
    var dot = ""
    var id = req.params.id
    /* Vou buscar numa query a informação toda */
    var query = "select * where {\n" +
        "clav:" + id + " ?p ?o .\n" +
        "}"

    client.query(query)
        .execute()
        .then(function (qres) {
            console.log(JSON.stringify(qres))
            var resList = qres.results.bindings
            var myData = {}
            var p = ""
            var o = ""
            for(var i in resList){
                p = resList[i].p.value.slice(resList[i].p.value.indexOf('#')+1)
                o = resList[i].o.value.slice(resList[i].o.value.indexOf('#')+1)
                if(myData[p])
                  myData[p].push(o)
                else
                  myData[p] = [o]
            }
            console.log('MYDATAJSON: \n\n'+JSON.stringify(myData))
            var dot = " digraph Diagrama {\n" +
                    'rankdir=LR ;\n' +
                    'node [style="filled"];\n' +
                    'start [label="' + id + '",fillcolor=lightgrey];\n'

            for(j in myData){
                for(k in myData[j]){
                    var l = myData[j][k].slice(0,40)
                    dot += 'f'+j+k+' [label="'+l+'",href="https://owl-dot-browser.herokuapp.com/'+l+'"];\n'
                    dot += 'start -> f'+j+k+' [label="'+j+'"];\n'
                }
            }

            dot += '}'
            console.log('\n\n\n'+dot)
            // res.send('<p>OK</p>')
            res.render("showClasse", {renderingCode:'d3.select("#graph").graphviz().renderDot(\`'+dot+'\`)'})
        })
        .catch(function (error) {
            console.log('ERRO: ' + error)
            res.render("error", {error: error})
        })
})
            
module.exports = router;
