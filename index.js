const api = require('./api');
const symbol = process.env.SYMBOL;
const profitability = parseFloat(process.env.PROFITABILITY);
const coin = process.env.COIN;
const goodBuy = process.env.GOOD_BUY;

setInterval(async () => {
    let buy, sell = 0;
    const result =  await api.depth(symbol);

    if (result.bids && result.bids.length) {
        console.log(`Highest Buy: ${result.bids[0][0]}`);
        buy = parseFloat(result.bids[0][0]);
    }
    if (result.asks && result.asks.length) {
        console.log(`Lowest Sell: ${result.asks[0][0]}`);
        sell = parseFloat(result.asks[0][0]);
    }

    if (sell && sell < goodBuy) {
        console.log(`Hora de Comprar!!!`);
        const account = await api.accountInfo();
        const coins = account.balances.filter(b => symbol.indexOf(b.asset) !== -1);
        console.log('PROSIÇÃO DA CARTEIRA');
        console.log(coins);

        console.log('Verificando se tenho grana...');
        const walletCoin = parseFloat(coins.find(c => c.asset === coin).free);
        const qty = parseFloat((walletCoin / sell)- 0.00001).toFixed(5); // cálculo da quantidade
        console.log(`qty: ${qty}`);
        if (qty > 0){
            console.log('Temos grana! Comprando agora...');
            const buyOrder = await api.newOrder(symbol, qty);
            console.log(`orderId: ${buyOrder.orderId}`);
            console.log(`status: ${buyOrder.status}`);

            if(buyOrder.status === 'FILLED'){
                console.log('Posicionando venda futura...');
                const price = parseFloat(sell * profitability).toFixed(5);
                console.log(`Vendendo por ${price} (${profitability})`);
                const sellOrder = await api.newOrder(symbol, 1, price, 'SELL', 'LIMIT');
                console.log(`orderId: ${sellOrder.orderId}`);
                console.log(`status: ${sellOrder.status}`);
            }
        } else {
            console.log('Sem grana... :-(');
        }
    }
    else if (buy && buy > 250) {
        console.log(`Hora de Vender!!!`);
    }
    else {
        console.log(`Esperando mercado se mexer!!!`);
    }
    }, process.env.CRAWLER_INTERVAL);