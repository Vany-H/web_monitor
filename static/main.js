const flag = false;
const socket = io();
const url = 'https://monitor-for.herokuapp.com';
// const url = 'http://localhost:8080';

const searchButtom = document.querySelector('.search-button');
const searchString = document.querySelector('.search-bar');
const infoBoxOfTarget = document.querySelector(
  '.info-div.flex-display-column.not-center-flex.flex-display',
);

let timeRequest = [];
let timeStamp = [];

let timePingRequest = [];
let timePingStamp = [];

function connectSucceful(DOMElement, flagConnect = true) {
  DOMElement.classList.add(`${flagConnect ? 'connect' : 'disconect'}`);
  DOMElement.classList.remove(`${!flagConnect ? 'connect' : 'disconect'}`);
}

function chart(selector, xValues, yValues) {
  new Chart(selector, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: [
        {
          fill: false,
          lineTension: 0,
          backgroundColor: 'rgba(0,0,255,1.0)',
          borderColor: 'rgba(255,0,255,0.5)',
          data: yValues,
        },
      ],
    },
    options: {
      legend: { display: false },
    },
  });
}

function chartDead(name) {
  const canvas = document.getElementById(name);
  const ctx = canvas.getContext('2d');
  ctx.font = '44px Comic Sans MS';
  ctx.fillStyle = 'red';
  ctx.fillText('SERVER DEAD', 0, canvas.height / 2);
}

function chartCominSoon(name) {
  const canvas = document.getElementById(name);
  const ctx = canvas.getContext('2d');
  ctx.font = '40px Comic Sans MS';
  ctx.fillStyle = 'white';
  ctx.fillText('COMING SOON', 0, canvas.height / 2);
}

async function testConnection(url, selector = '.indecator.http') {
  const indecator = document.querySelector(selector);

  connectSucceful(indecator, false);

  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  connectSucceful(indecator);
}

async function getInfoOfIp(searchUrl) {
  const response = await fetch(
    `${url.replace(/\/$/gm, '')}/connect/info?url=${searchUrl}`,
    {
      method: 'GET',
      redirect: 'follow',
    },
  ).then((data) => data.json());

  return response;
}

testConnection(url);
searchButtom.onclick = async () => {
  const objectInfo = await getInfoOfIp(searchString.value);
  const html = Object.entries(objectInfo).reduce((accum, [key, value]) => {
    accum =
      accum +
      `<div class="test pading-1 box-display-left">
    <div class="color-orange">${key}:</div>
    <div>${value}</div>
    </div>`;

    return accum;
  }, '<div class="test color-white">{</div>\n');

  infoBoxOfTarget.innerHTML = `${html}\n <div class="test color-white">}</div>`;

  socket.emit('connection-ip', { url: searchString.value });
};

chartCominSoon('upd');

setInterval(() => {
  testConnection(url);
}, 60000);
