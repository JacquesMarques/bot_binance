const express = require('express');

const app = express();
const path = require('path');
const api = require('./api');
const symbol = process.env.SYMBOL;
const coin = process.env.COIN;
const goodBuy = process.env.GOOD_BUY;
const profitability = process.env.PROFITABILITY;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/data', async (req, res) => {
    const data = {};

    const market = await api.depth(symbol);
    data.buy = market.bids.length ? market.bids[0][0] : 0;
    data.sell = market.asks.length ? market.asks[0][0] : 0;

    const wallet = await api.accountInfo();
    const coins = wallet.balances.filter(b => symbol.indexOf(b.asset) !== -1);
    data.coins = coins;

    const sellPrice = parseFloat(data.sell);
    const walletCoin = parseFloat(coins.find(c => c.asset === coin).free);
    console.log(walletCoin);

    if (sellPrice && sellPrice < goodBuy) {
        const qty = parseFloat((walletCoin / sellPrice)- 0.01).toFixed(2); // cálculo da quantidade
        console.log(`qty: ${qty}`);
        if (qty > 0){
            console.log('Temos grana! Comprando agora...');
            const buyOrder = await api.newOrder(symbol, qty);
            data.buyOrder = buyOrder;

            if(buyOrder && buyOrder.status === 'FILLED'){
                console.log(`orderId: ${buyOrder.orderId}`);
                console.log(`status: ${buyOrder.status}`);

                console.log('Posicionando venda futura...');
                const price = parseFloat(sellPrice * profitability).toFixed(5);
                console.log(`Vendendo por ${price} (${profitability})`);
                const sellOrder = await api.newOrder(symbol, qty, price, 'SELL', 'LIMIT');
                data.sellOrder = sellOrder;
                if (sellOrder){
                    console.log(`orderId: ${sellOrder.orderId}`);
                    console.log(`status: ${sellOrder.status}`);
                }
            }
        } else {
            const sellOrder = await api.newOrder(symbol, 5, 0, 'SELL', 'MARKET');
            data.sellOrder = sellOrder;
            if (sellOrder){
                console.log(`orderId: ${sellOrder.orderId}`);
                console.log(`status: ${sellOrder.status}`);
            }
        }
    }

    res.json(data);
});

app.use('/', (req, res) => {
    console.log('entrou!');
    res.render('app', {
        symbol: symbol,
        profitability: process.env.PROFITABILITY,
        lastUpdate: new Date(),
        interval: parseInt(process.env.CRAWLER_INTERVAL)
    });
});

app.listen(process.env.PORT, () => {
    console.log('App rodando!');
})