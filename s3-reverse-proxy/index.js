import express from "express";
import httpproxy from "http-proxy";

const port = 8000;
const app = express();
const basepath = "https://deploy--project.s3.amazonaws.com/__output";
const proxy = httpproxy.createProxy();
app.use((req, res) => {
  const hostname = req.hostname;
  const subdomain = hostname.split(".")[0];

  const resolveTO = `${basepath}/${subdomain}`;

  // reverse proxy
  return proxy.web(
    req,
    res,
    { target: resolveTO, changeOrigin: true },
    (error) => console.log(error)
  );
});

proxy.on("proxyReq", (proxyReq, req, res) => {
    const url = req.url;
    // append index.html in url
    if (url == "/") {
      proxyReq.path +="index.html";
    }
  });

app.listen(port, () => console.log(`Running at ${port}`));
