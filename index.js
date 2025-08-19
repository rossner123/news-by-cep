import express from "express"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.get("/", (req, res) => {
    res.render("index.ejs")
})

app.post("/news", async (req, res) => {
    const cep = req.body.cep
    const topic = req.body.topic || ""

    try {
        const cepResult = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        const estado = cepResult.data.uf

        if(!estado){
            return res.render("news.ejs", {estado: null, topic: topic, artigos: [], error: "Estado não encontrado"})
        }

        const newsResult = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: `${estado} ${topic}`,
                apiKey: NEWS_API_KEY,
                language: "pt",
                sortBy: "publishedAt",
                pageSize: 5,
            }
        })

        const artigos = []
        newsResult.data.articles.forEach((artigo) => {
            artigos.push({
                title: artigo.title,
                url: artigo.url,
                source: artigo.source.name,
                publishedAt: new Date(artigo.publishedAt).toLocaleString("pt-BR")
            })
        })

        res.render("news.ejs", {
            estado: estado,
            topic: topic,
            artigos: artigos,
            error: null
        })

    } catch (error) {
        console.log(error.message)
        res.render("news.ejs", {estado: null, topic: topic, artigos: [], error: "Erro ao buscar notícias"})
    }
})

app.listen(3000, () => {
    console.log("rodando...")
})