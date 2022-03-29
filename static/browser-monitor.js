function sendRequest(url) {
  const interval = setInterval(async () => {
    try {
      const startMs = moment().valueOf();
      const answere = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
      });

      if (answere.status > 499) chartDead('http');

      timeRequest.push(moment().valueOf() - startMs);
      timeStamp.push(moment().format('LTS'));

      chart('http', timeStamp, timeRequest);
    } catch (error) {
      charError('http');
      addLog(error, 'error');
    }
  }, 10000);

  intervalsArray.push(interval);
}

function clearAllInterval() {
  intervalsArray.forEach((el) => clearInterval(el));
}

async function moveOnBrowser(url) {
  socket.disconnect();

  timePingRequest = [];
  timePingStamp = [];
  timeRequest = [];
  timeStamp = [];

  // chart('ping', timePingStamp, timePingRequest);
  chart('http', timeStamp, timeRequest);

  chartNotWork('ping');
  chartNotWork('HvSS');
  sendRequest(url);
}

async function moveOffBrowser(url) {
  socket.connect();
  clearAllInterval();
  socket.emit('connection-ip', { url });

  timePingRequest = [];
  timePingStamp = [];
  timeRequest = [];
  timeStamp = [];

  chart('ping', timePingStamp, timePingRequest);
  chart('HvSS', timePingStamp, timePingRequest);
  chart('http', timeStamp, timeRequest);
}
