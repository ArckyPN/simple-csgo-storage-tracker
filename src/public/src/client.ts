let edit = sessionStorage.getItem("edit") === "true" ? true : false;

function XHRRequest(method: string, url: string, callback: () => void, body?: any) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body));
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback();
        }
    }
}

function deleteItem(index: number) {
    let num = prompt("How do you want to delete?");
    if ( num === null ) {
        return;
    }
    num = num === "" ? "1000" : num;
    XHRRequest("DELETE", `/${index}/${num}`, () => {
        location.reload();
    });
}

function updateItem(name: string) {
    XHRRequest("GET", `/update-item/${name}`, () => {
        location.reload();
    });
}

function updateAll() {
    XHRRequest("GET", "/update-all", () => {
        location.reload();
    });
}

function updatePrice(index: number, name: string) {
    const newPrice = (document.getElementById(`unkownStarting${index}`) as HTMLInputElement).valueAsNumber;
    XHRRequest("PUT", "/update-start", () => {
        location.reload();
    }, { newPrice, name });
}

function addItem() {
    const name = (document.getElementById("newName")! as HTMLInputElement).value;
    const quantity = (document.getElementById("newQuantity")! as HTMLInputElement).valueAsNumber;
    const cost = (document.getElementById("newCost")! as HTMLInputElement).valueAsNumber;
    const unit = (document.getElementById("newUnit")! as HTMLInputElement).value;
    const newItem = { name, quantity, cost, unit, startingPrice: 0 };
    XHRRequest("POST", "/add-item", () => {
        location.reload();
    }, newItem);
}

function filterStorage(storage: any) {
    return storage.map((item: any) => {
        const dubs = storage.filter((i: any) => i.name === item.name);
        if ( dubs.length === 1 ) {
            item.cost = item.cost * item.quantity;
            return item;
        }
        return dubs.reduce((acc: any, i: any) => {
            return {
                name: item.name,
                cost: acc.cost + i.cost * i.quantity,
                quantity: acc.quantity + i.quantity,
                startingPrice: item.startingPrice
            }
        }, {
            name: item.name,
            cost: 0,
            quantity: 0,
            startingPrice: item.startingPrice
        });
    }).filter((item: any, index: number, array: any[]) => array.findIndex((i: any) => i.location === item.location && i.name === item.name) === index).sort((a: any, b:any) => {
        return a.name > b.name;
    });
}

async function fillTable() {
    const resStorage = await fetch("/storage.json");
    const resPrices = await fetch("/prices.json");
    let sumCost = 0, sumStart = 0, sumPrice = 0, sumQuantity = 0;
    const data = edit ? JSON.parse(await resStorage.text()) : filterStorage(JSON.parse(await resStorage.text()));
    if (edit) data.sort((a: any, b: any) => a.name > b.name);
    const prices = JSON.parse(await resPrices.text()) as any[];
    const table = document.getElementById("itemTable")! as HTMLTableElement;
    if (edit) {
        const unitHeader = document.createElement("th");
        unitHeader.innerText = "Unit";
        table.children[0].children[0].insertBefore(unitHeader, table.children[0].children[0].children[4]);
    } 
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    const thead = document.createElement("thead");
    table.appendChild(thead);
    data.forEach((item: any, index: number) => {
        let price = prices.find((price: any) => price.name === item.name);
        price = price === undefined ? 0 : price.price;
        sumCost += item.cost;
        sumStart += (item.startingPrice * item.quantity);
        sumPrice += (price * item.quantity);
        sumQuantity += item.quantity;
        const tr = tbody.insertRow();
        insertNumber(tr, index+1, "num");
        insertString(tr, item.name);
        insertNumber(tr, item.quantity, "num");
        insertNumber(tr, item.cost, "price");
        if (edit) insertString(tr, item.unit);
        insertStartingPrice(tr, index, item);
        insertNumber(tr, item.startingPrice * item.quantity, "price");
        insertNumber(tr, price, "price");
        insertNumber(tr, price * item.quantity, "price");
        insertProfit(tr, parseFloat((price - item.startingPrice).toFixed(2)));
        insertProfit(tr, parseFloat(((price - item.startingPrice) * item.quantity).toFixed(2)));
        insertUpdateButton(tr, index, item);
        if (edit) insertDeleteButton(tr, index);
    });
    const sumItems = document.getElementById("numItems")! as HTMLSpanElement;
    sumItems.innerHTML = `${sumQuantity}`;
    const totalInvest = document.getElementById("totalInvest")! as HTMLSpanElement;
    totalInvest.innerHTML = `${sumCost.toFixed(2)}€`;
    const totalStart = document.getElementById("totalStart")! as HTMLSpanElement;
    totalStart.innerHTML = `${sumStart.toFixed(2)}€`;
    const totalToday = document.getElementById("totalToday")! as HTMLSpanElement;
    totalToday.innerHTML = `${sumPrice.toFixed(2)}€`;
}

function insertNumber(tr: HTMLTableRowElement, num: number, mode: "num" | "price") {
    switch (mode) {
        case "price":
            tr.insertCell().innerHTML = `<span class="number">${num.toFixed(2)}€</span>`
            break;
        case "num":
            tr.insertCell().innerHTML = `<span class="number">${num}</span>`
            break;
        default:
            break;
    }
}

function insertString(tr: HTMLTableRowElement, str: string) {
    tr.insertCell().innerHTML = str;
}

function insertStartingPrice(tr: HTMLTableRowElement, index: number, item: any) {
    if ( item.startingPrice === 0 ) {
        tr.insertCell().innerHTML = `<input type="number" id="unkownStarting${index}" name="${item.name}"><button id="addUnkownStarting${index}">+</button>`;
        document.getElementById(`addUnkownStarting${index}`)!.onclick = () => {
            updatePrice(index, item.name);
        }
    } else {
        tr.insertCell().innerHTML = `<span class="number">${item.startingPrice}€</span>`;
    }
}

function insertProfit(tr: HTMLTableRowElement, profitVal: number) {
    let profit: string;
        if (profitVal > 0) {
            profit = `<span class="positive profit number">+${profitVal.toFixed(2)}</span>`;
        } else if (profitVal < 0) {
            profit = `<span class="negative profit number">${profitVal.toFixed(2)}</span>`;
        } else {
            profit = `<span class="profit number">${profitVal.toFixed(2)}</span>`
        }
        tr.insertCell().innerHTML = `${profit}`;
}

function insertUpdateButton(tr: HTMLTableRowElement, index: number, item: any) {
    tr.insertCell().innerHTML = `<button id="update${index}">Update</button>`;
        document.getElementById(`update${index}`)!.onclick = () => {
            updateItem(item.name);
        };
}

function insertDeleteButton(tr: HTMLTableRowElement, index: number) {
    tr.insertCell().innerHTML = `<button id="delete${index}" onclick='deleteItem(${index})'>Delete</button>`;
    document.getElementById(`delete${index}`)!.onclick = () => {
        deleteItem(index);
    };
}

function clearInputs() {
    const inputs = document.getElementsByTagName("input");
    for ( const input of inputs ) {
        input.value = "";
    }
}

async function unitTable() {
    const resStorage = await fetch("/storage.json");
    const data = JSON.parse(await resStorage.text()).map((item: any, index: number, array: any) => {
        const dubs = array.filter((i: any) => i.unit === item.unit);
        if ( dubs.length === 1 ) {
            return {
                unit: item.unit,
                quantity: item.quantity,
            };
        }
        return dubs.reduce((acc: any, i: any) => {
            return {
                unit: item.unit,
                quantity: acc.quantity + i.quantity,
            }
        }, {
            unit: item.unit,
            quantity: 0,
        });
    }).filter((item: any, index: number, array: any[]) => array.findIndex((i: any) => i.location === item.location && i.unit === item.unit) === index).sort((a: any, b:any) => {
        return a.unit > b.unit;
    });

    const table = document.getElementById("unitTable")! as HTMLTableElement;
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);
    data.forEach((item: any, index: any) => {
        const tr = tbody.insertRow();
        insertNumber(tr, index+1, "num");
        insertString(tr, item.unit);
        insertNumber(tr, item.quantity, "num");
    });
}

async function main() {
    clearInputs();
    fillTable();
    unitTable();
    
    document.getElementById("editMode")!.innerText = edit ? "Edit Mode: ON" : "Edit Mode: OFF";
    document.getElementById("editMode")!.onclick = () => {
        sessionStorage.setItem("edit", (!edit).toString());
        location.reload();
    };
    document.getElementById("updateAll")!.onclick = updateAll;
    document.getElementById("addNewItem")!.onclick = addItem;
}

main();