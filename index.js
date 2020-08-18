require('dotenv').config()


const restify = require('restify')
const app = restify.createServer({ version: 1.0, name: "video" });
const mongoose = require('mongoose');

app.get('/', function (req, res, next) {
    res.send(200, 'hello world');
    return next();
})


mongoose.connect("mongodb+srv://sampler:12345@cluster0-lqjhc.mongodb.net/videos?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

const router = require('./router/routers')



//SERVER HEADERS
app.use((req, res, next) => { //Cria um middleware onde todas as requests passam por ele 
    if (req.headers["x-forwarded-proto"] == "http") //Checa se o protocolo informado nos headers é HTTP 
        res.redirect(`https://${req.headers.host}${req.url}`); //Redireciona pra HTTPS 
    else //Se a requisição já é HTTPS 
        next(); //Não precisa redirecionar, passa para os próximos middlewares que servirão com o conteúdo desejado 
});

/*app.use(function (req, res, next) {
    res.redirect = function (addr) {
        res.header('Location', addr);
        res.send(302);
    }
});*/

app.use((req, res, next) => {
    res.header('content-type', 'json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, Content-Type, Origin, token, Authorization, Accept, Client-Security-Token, Accept-Encoding, X-Auth-Token"
    );
    next();
});

function unknownMethodHandler(req, res, next) {
    if (req.method.toLowerCase() === "options") {
        console.log("received an options method request");
        let allowHeaders = [
            "Accept",
            "Accept-Version",
            "Content-Type",
            "Api-Version",
            "token",
            "Origin",
            "X-Requested-With",
            "Authorization"
        ]; // added Origin & X-Requested-With & *Authorization*
        if (res.methods.indexOf("OPTIONS") === -1) res.methods.push("OPTIONS");
        res.header("Access-Control-Allow-Credentials", true);
        res.header("Access-Control-Allow-Headers", allowHeaders.join(", "));
        res.header("Access-Control-Allow-Methods", res.methods.join(", "));
        res.header("Access-Control-Allow-Origin", "*" /*req.headers.origin*/);
        return res.send(200);
    } else {
        res.status(400);
        return res.json({ msg: "Estamos passando por instabilidades" });
    }
}

app.on("MethodNotAllowed", unknownMethodHandler);


//app.use(cors(options))

app.use(restify.plugins.bodyParser({ mapParams: true }));
app.use(restify.plugins.acceptParser(app.acceptable));
app.use(restify.plugins.queryParser({ mapParams: true }));
app.use(restify.plugins.fullResponse());


//router(app)

app.listen(process.env.PORT || 3000, () => { console.log("Conectado com sucesso") }
)