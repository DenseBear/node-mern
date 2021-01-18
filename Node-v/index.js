const fs = require('fs');
const http = require('http');
const url = require('url');

//Blocking Synchronous I/O Method (Depreciated) ES6 =>
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
//console.log(textIn);
const textOut = ` ${textIn}.\nCreated on ${Date.now()} `;
fs.writeFileSync('./txt/output.txt', textOut);
//Non-Blocking Asynchronous I/O Method (Callback-H)
fs.readFile('./txt/start.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log(`ERR:${err}`);
        return;
    }
    //console.log(`Extracted/Printing data in: ${data}`);
    fs.readFile(`./txt/${data}.txt`, 'utf-8', (err, data1) => {
        //console.log(data1);
        fs.readFile('./txt/append.txt', 'utf-8', (err, data2) => {
            //console.log(data2);
            fs.writeFile('./txt/final.txt', `${data1}\n${data2}`,'utf-8',(err) => {
                    //console.log('File Complete With Read-This and Append');
                }
            );
        });
    });
});



//NODE.JS Server- 
const replaceTemplate = (temp, product) =>{
    let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
     output = output.replace(/{%IMAGE%}/g, product.image);
     output = output.replace(/{%PRICE%}/g, product.price);
     output = output.replace(/{%FROM%}/g, product.from);
     output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
     output = output.replace(/{%QUANTITY%}/g, product.quantity);
     output = output.replace(/{%DESCRIPTION%}/g, product.description);
     output = output.replace(/{%ID%}/g, product.id);

     if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
     return output;
    //ASYNC 



}

//TopLevelCode is executed once on start so it doesnt block the callback (PRERENDERED)
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const dataObj = JSON.parse(data);



//Server Initialization for Each Request
const server = http.createServer((req, res) => {
    //taking query and pathname from the parse method in dependency url
    const {query, pathname} = url.parse(req.url, true)


//request OVERVIEW PAGE
    if (pathname === '/' || pathname === '/overview') {
        
        res.writeHead(200, {'Content-type': 'text/html'});


        //Loops each object in the json, makes template using tempcard, and replaces using the function. Joins together to a string (HTML FORM)
        const cardsHtml = dataObj.map(element => replaceTemplate(tempCard, element)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)
        res.end(output);
    } 


//request PRODUCT PAGE
    else if (pathname === '/product') {
        res.writeHead(200, {'Content-type': 'text/html'});

        //takes the template and replaces it with the product with query becasuse id is same as index
        console.log('User Access New Query at: ', query, 'Router URL: ', pathname)
        const product = dataObj[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.end(output);
    }
//request dev API
    else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json'})
        res.end(data + '<h1>rendered in JSON Head Type 200 (NO HTML RAW)</h1>');
        

//ERR NOT FOUND
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'Extra-Data':
                'This is used with res.writeHead for the error code 404',
        });
        res.end('<h1>Page Not Found</h1>');
    }
    //Called once for each request made (Client DIR Route/ Refresh)
});

const PORT = 8000;
const LOCALHOST = '127.0.0.1';
server.listen(PORT, LOCALHOST, () => {
    console.log('Listening to requests on port 8000');
});
