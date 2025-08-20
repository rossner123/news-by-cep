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
    const page = parseInt(req.body.page) || 1

    try {
        const cepResult = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
        const estado = cepResult.data.uf

        if(!estado){
            return res.render("news.ejs", {estado: null, topic, artigos: [], error: "Estado não encontrado", currentPage: page, cep})
        }

        const newsResult = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: `${estado} ${topic}`,
                apiKey: NEWS_API_KEY,
                language: "pt",
                sortBy: "publishedAt",
                pageSize: 10,
                page: page
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
            estado,
            topic,
            artigos,
            error: null,
            currentPage: page,
            cep
        })

    } catch (error) {
        console.log(error.message)
        res.render("news.ejs", {estado: null, topic, artigos: [], error: "Erro ao buscar notícias", currentPage: page, cep})
    }
})

app.listen(3000, () => {
    console.log("rodando...")
})