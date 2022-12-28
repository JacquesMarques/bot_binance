const axios = require('axios');
const querystring = require('querystring');

async function publifCall(path, data, method = 'GET'){
    try{
        const qs = data ? `?${querystring.stringify(data)}` : '';
        const result = await axios({
            method,
            url: `${process.env.API_URL}${path}${qs}`
        })
        return result.data;
    } catch(err) {
        console.log(err);
    }
}

async function depth(symbol = 'BTCBRL', limit = 5){
    return publifCall('/v3/depth', {symbol, limit});
}

async function time(){
    return publifCall('/v3/time');
}

module.exports = { time, depth }