socket.on('connection', (data) => {
  const indecator = document.querySelector('.indecator.socket');
  if (!data) throw new Error('Disconect to server');
  connectSucceful(indecator);
});

socket.on('http-data', (data) => {
  if (data === 'dead') {
    const canvas = document.getElementById('http');
    const ctx = canvas.getContext('2d');
    ctx.font = '44px Comic Sans MS';
    ctx.fillStyle = 'red';
    ctx.fillText('SERVER DEAD', 0, canvas.height / 2);

    return;
  }

  timeRequest.push(data.ms);
  timeStamp.push(data.date);

  chart('http', timeStamp, timeRequest);
});

socket.on('ping-data', (data) => {
  console.log(data);
  if (data === 'dead') {
    const canvas = document.getElementById('ping');
    const ctx = canvas.getContext('2d');
    ctx.font = '44px Comic Sans MS';
    ctx.fillStyle = 'red';
    ctx.fillText('SERVER DEAD', 0, canvas.height / 2);

    return;
  }

  timePingRequest.push(data.ms);
  timePingStamp.push(data.date);

  chart('ping', timePingStamp, timePingRequest);
});

socket.on('clear', (data) => {
  timePingRequest = [];
  timePingStamp = [];
  timeRequest = [];
  timeStamp = [];

  chart('ping', timePingStamp, timePingRequest);
  chart('http', timeStamp, timeRequest);
});
