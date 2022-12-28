const api = require('./api');
const symbol = process.env.SYMBOL;

setInterval(async () => {
    let buy, sell = 0;
    const result =  await api.depth(symbol);

    if (result.bids && result.bids.length) {
        console.log(`Highest Buy: ${result.bids[0][0]}`);
        buy = parseInt(result.bids[0][0]);
    }
    if (result.asks && result.asks.length) {
        console.log(`Lowest Sell: ${result.asks[0][0]}`);
        sell = parseInt(result.asks[0][0]);
    }

    if (sell < 250) {
        console.log(`Hora de Comprar!!!`);
        const account = await api.accountInfo();
        const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1);
        console.log('PROSIÇÃO DA CARTEIRA');
        console.log(coins);
    }
    else if (buy > 250) {
        console.log(`Hora de Vender!!!`);
    }
    else {
        console.log(`Esperando mercado se mexer!!!`);
    }
    }, process.env.CRAWLER_INTERVAL);