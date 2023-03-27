import Express from "express";
import open from "open";
import { readFileSync, writeFileSync, existsSync, write } from "fs";
import { execSync } from "child_process";
import bodyParser from "body-parser";
import axios from "axios";

function firstStartUp() {
    if (!existsSync("storage.csv") && !(existsSync("dist/public/storage.json") && existsSync("dist/public/prices.json"))) {
        console.log("storage.csv doesn't exists! creating storage.json and prices.json...")
        execSync(`echo [] > dist/public/storage.json`);
        execSync(`echo [] > dist/public/prices.json`);
        return;
    }
    if (existsSync("storage.csv") && !(existsSync("dist/public/storage.json") && existsSync("dist/public/prices.json"))) {
        console.log("parsing storage.csv...");
        const storage: any = [];
        const data = readFileSync("storage.csv", "utf-8");
        const lines = data.split(/\r?\n/);
        lines.forEach((line, index) => {
            if (index <= 0) return;
            if (line.length) {
                const items = line.split(";").map((item: any) => item.trim());
                storage.push({
                    name: items[0],
                    quantity: parseInt(items[1]),
                    cost: parseFloat(items[2]),
                    unit: items[3],
                    startingPrice: 0
                });
            }
        });
        writeFileSync("dist/public/storage.json", JSON.stringify(storage));
        execSync(`echo [] > dist/public/prices.json`);
        return;
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadStorage() {
    return JSON.parse(readFileSync("dist/public/storage.json", "utf-8"));
}

function saveStorage(storage: any) {
    writeFileSync("dist/public/storage.json", JSON.stringify(storage));
}

function loadPrices() {
    return JSON.parse(readFileSync("dist/public/prices.json", "utf-8"));
}

function savePrices(prices: any) {
    writeFileSync("dist/public/prices.json", JSON.stringify(prices));
}

firstStartUp();

const port = 8080;
const app = Express();

app.use(bodyParser.json());
app.use("/", Express.static("dist/public"));

app.get("/update-all", async (req, res) => {
    let prices: any = [];
    const storage = loadStorage();
    const names = storage.map((item: any) => item.name.trim()).filter((item: any, index: number, array: any[]) => array.indexOf(item) === index).sort();   
    (function loop(i) {
        setTimeout(async () => {
            const name = names[i-1];
            const data = await axios.get("http://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=" + encodeURIComponent(name));
            if ( data.data.lowest_price ) {
                const price = data ? parseFloat(data.data.lowest_price.replace("€", "").split(",").join(".")) : 0;
                console.log(`Updated ${name} to ${price}€`);
                prices.push({ name, price });
            } else {
                console.log(`Steam didn't return any data for ${name}`);
            }
            if (i === 1) {
                prices.sort((a: any, b:any) => a.name > b.name);
                savePrices(prices);
                res.status(200).json("");
            }
            if (--i) loop(i);
        }, 3500);
    })(names.length);
});

app.get("/update-item/:name", async (req, res) => {
    const prices = loadPrices();
    const name = req.params.name;
    let data;
    try {
        data = await axios.get("http://steamcommunity.com/market/priceoverview/?appid=730&currency=3&market_hash_name=" + encodeURIComponent(name));
        if (!data.data.success || !data.data.lowest_price) {
            res.status(500).json("");
            return;
        }
    } catch (err) {
        res.status(500).json("");
        return;
    }
    const price = data ? parseFloat(data.data.lowest_price.replace("€", "").split(",").join(".")) : 0;
    const newPrice = { name, price };
    const oldPrice = prices.find((item: any) => item.name === name);
    if ( oldPrice ) {
        oldPrice.price = newPrice.price;
    } else {
        prices.push(newPrice);
    }
    savePrices(prices);
    res.status(200).json("");
});

app.post("/add-item", (req, res) => {
    const newItem = req.body;
    const storage = loadStorage();
    storage.push(newItem);
    saveStorage(storage);
    res.status(200).json("");
});

app.put("/update-start", (req, res) => {
    const newPrice = req.body;
    const storage = loadStorage();
    storage.map((item: any) => {
        if ( item.name === newPrice.name ) {
            item.startingPrice = newPrice.newPrice;
        }
        return item;
    });
    saveStorage(storage);
    res.status(200).json("");
});

app.delete("/:id/:num", (req, res) => {
    const id = req.params.id;
    const num = parseInt(req.params.num);
    const storage = loadStorage();
    if ( num >= storage[id].quantity ) {
        storage.splice(id, 1);
    } else {
        storage[id].quantity -= num;
    }
    saveStorage(storage);
    res.status(200).json("");
});

app.listen(port, () => {
    console.log("Server running on http://localhost:8080");
    if ( !process.argv.includes("--dev") ) {
        open(`http://localhost:${port}`);
    }
});