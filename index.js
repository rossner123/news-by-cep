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
        const estado = cepResult.data.estado

        if(!estado){
            res.status(404).json({error: "Cidade não encontrada para este CEP."})
        }

        const newsResult = await axios.get(`https://newsapi.org/v2/everything`, {
            params: {
                q: `${estado} ${topic}`,
                apiKey: NEWS_API_KEY,
                language: "pt",
                sortBy: "publishedAt",
                pageSize: 1,
            }
        })

        console.log(newsResult.data)

        res.render("news.ejs", {
            estado: estado,
            topic: topic,
        })

    } catch (error) {
        console.log(error.message)
    }
})

app.listen(3000, () => {
    console.log("rodando...")
})