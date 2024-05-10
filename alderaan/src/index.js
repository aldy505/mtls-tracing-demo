import express from "express";
import cors from "cors";
import * as Sentry from "@sentry/node";
import * as fs from "node:fs";
import * as https from "node:https";

Sentry.init({
    // TODO: Replace this with your own DSN. This DSN points to a demo project that doesn't exist.
    dsn: "https://9438d99e1ececbadb20f558de65572c3@sentry.teknologiumum.com/22",
    tracesSampleRate: 1.0,
    integrations: [Sentry.httpIntegration({tracing: true})],
});

const app = express();

// Add the Express integration at a later time
Sentry.addIntegration(new Sentry.Integrations.Express({app}));

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("OK");
});

app.post("/login", (req, res, next) => {
    return Sentry.startSpan({
        op: "alderaan.login",
        name: "Login"
    }, span => {
        const {username, password} = req.body;

        if (username === "johndoe@example.com" && password === "B0ssman69") {
            let response = "";

            const httpRequest = Sentry.startSpan(
                {
                    op: "http.client",
                    name: "GET https://localhost:7153/user",
                    description: "GET https://localhost:7153/user",
                },
                span => https.request(
                    {
                        hostname: "localhost",
                        port: 7153,
                        path: `/user?id=john`,
                        method: "GET",
                        cert: fs.readFileSync("../certs/alderaan.crt"),
                        key: fs.readFileSync("../certs/alderaan.key"),
                        ca: fs.readFileSync("../certs/rootCA.crt"),
                        headers: {
                            "Content-Type": "application/json",
                            // NOTE: I failed to get the distributed tracing integration to work, so I did this manually
                            "sentry-trace": `${span.spanContext().traceId}-${span.spanContext().spanId}`,
                            "traceparent": span.toTraceparent(),
                            "baggage": `sentry-trace_id=${span.spanContext().traceId},sentry-public_key=9438d99e1ececbadb20f558de65572c3,sentry-sample_rate=1.0;`
                        }
                    },
                    httpResponse => {
                        httpResponse.on("data", function (data) {
                            response += data.toString();
                        });

                        httpResponse.on("error", (err) => {
                            Sentry.captureException(err);

                            res.status(500).json({message: "Internal server error"});
                            httpRequest.end();
                            next();
                        });

                        httpResponse.once("end", () => {
                            res.writeHead(200, {"Content-Type": "application/json"})
                                .end(response);
                            httpRequest.end();
                            next();
                        });
                    }
                )
            );

            httpRequest.end();
        } else {
            res.status(401).send("Invalid credentials");
            next();
        }
    })
});

app.use(Sentry.Handlers.errorHandler());

app.listen(3000);