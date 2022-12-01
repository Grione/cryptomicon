const API_KEY = 'd4cd92985fb3fcc617d7cb64ed6f941c9148000f7d8fa162293f8b9fd94df8ee';

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?&api_key=${API_KEY}`);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);

  if (type !== AGGREGATE_INDEX || newPrice == undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];

  handlers.forEach(fn => fn(newPrice, type))

});

const tickersHandlers = new Map();

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);
  if (socket.readyState == WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return
  }

  socket.addEventListener("open", () => {
    socket.send(stringifiedMessage);
  }, { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubAdd",
    "subs": [`5~CCCAGG~${ticker}~USD`]
  })
}

function unsubscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    "action": "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubsribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker);
};