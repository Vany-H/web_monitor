socket.on('connection', (data) => {
  const indecator = document.querySelector('.indecator.socket');
  if (!data) throw new Error('Disconect to server');
  connectSucceful(indecator);
});

//HHTP-------------------------------------------------------------

socket.on('http-data', (data) => {
  timeRequest.push(data.ms);
  timeStamp.push(data.date);

  chart('http', timeStamp, timeRequest);
});

socket.on('http-error', (data) => {
  charError('http');
  addLog('Server http error', 'error');
});

socket.on('http-dead', (data) => {
  chartDead('http');
  addLog('Target dead', 'warning');
});

//PING-------------------------------------------------------------

socket.on('ping-data', (data) => {
  timePingRequest.push(data.ms);
  timePingStamp.push(data.date);

  chart('ping', timePingStamp, timePingRequest);
});

socket.on('ping-error', (data) => {
  charError('ping');
  addLog('Server ping error', 'error');
});

socket.on('ping-dead', (data) => {
  chartDead('ping');
});

//HvSS-------------------------------------------------------------

socket.on('HvSS-data', (data) => {
  timeHvSSRequest.push(data.ms);
  timeHvSSStamp.push(data.date);

  chart('HvSS', timeHvSSStamp, timeHvSSRequest);
});

socket.on('HvSS-error', (data) => {
  charError('HvSS');
  addLog('Server HvSS error', 'error');
});

socket.on('HvSS-dead', (data) => {
  chartDead('HvSS');
});

//CLEAR-------------------------------------------------------------

socket.on('clear', (data) => {
  timePingRequest = [];
  timePingStamp = [];
  timeRequest = [];
  timeStamp = [];
  timeHvSSRequest = [];
  timeHvSSStamp = [];

  chart('ping', timePingStamp, timePingRequest);
  chart('http', timeStamp, timeRequest);
  chart('HvSS', timeStamp, timeRequest);
});
