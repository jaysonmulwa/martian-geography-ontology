const ParsingClient = require('sparql-http-client/ParsingClient')
const SparqlClient = require('sparql-http-client')
const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/all', (req, res) => {
    const response = all();
    res.status(200).send(response)
})

app.get('/query/:keyword', (req, res) => {
    const keyword = req.params.keyword;
    const response = keywordSearch(keyword);
    res.status(200).send(response)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

async function parse() { 
    const endpointUrl = 'http://localhost:80/test/kb.ttl'
    const query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    SELECT ?subject ?object
        WHERE { ?subject rdfs:subClassOf ?object }
    LIMIT 100`

    const client = new ParsingClient({ endpointUrl })
    const bindings = await client.query.select(query)
    bindings.forEach(row => 
        Object.entries(row).forEach(([key, value]) => {
        console.log(`${key}: ${value.value} (${value.termType})`)
        })
    )
}

async function all() {
    const client = new SparqlClient({ endpointUrl: 'http://localhost:3030/kb' })
    const stream = await client.query.select(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT * WHERE {
    ?sub ?pred ?obj .
    } LIMIT 10
    `)
    stream.on('data', row => {
        return row;
    })
}

async function keywordSearch(keyword) {
    const client = new SparqlClient({ endpointUrl: 'http://localhost:3030/kb' })
    const stream = await client.query.select(`
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT * WHERE {
    ?sub ?pred ?obj .
    VALUES ( ?sub ) {( <http://www.semanticweb.org/hp/ontologies/2023/0/planets-geography-ontology#${keyword}> )}
    } LIMIT 10
    `)
    let resp = null;
    stream.on('data', row => {
        resp = row
    })
    console.log(resp)
    return resp
}