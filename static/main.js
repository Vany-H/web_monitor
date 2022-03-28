let flag = false;

const socket = io();
// const url = 'https://monitor-for.herokuapp.com';
// const url = 'http://localhost:8080';
const url = 'http://185.143.220.239:8080';
const intervalsArray = [];

const searchButtom = document.querySelector('.search-button');
const searchString = document.querySelector('.search-bar');
const infoBoxOfTarget = document.querySelector('.serv-info');
const logsBox = document.querySelector('.logs');
const checkBrowser = document.querySelector('.check-box');

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '37px Comic Sans MS';
  ctx.fillStyle = 'red';
  ctx.fillText('SERVER DEAD', 0, canvas.height / 2);
}

function charError(name) {
  const canvas = document.getElementById(name);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '37px Comic Sans MS';
  ctx.fillStyle = 'red';
  ctx.fillText('SERVER ERROR', 0, canvas.height / 2);
}

function chartCominSoon(name) {
  const canvas = document.getElementById(name);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '37px Comic Sans MS';
  ctx.fillStyle = 'white';
  ctx.fillText('COMING SOON', 0, canvas.height / 2);
}

function chartNotWork(name) {
  const canvas = document.getElementById(name);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '37px Comic Sans MS';
  console.log('a');
  ctx.fillStyle = 'orange';
  ctx.fillText('Not work in Browser', 0, canvas.height / 2);
}

async function testConnection(url, selector = '.indecator.http') {
  const indecator = document.querySelector(selector);

  connectSucceful(indecator, false);
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
    connectSucceful(indecator);
  } catch (error) {
    addLog(error, 'error');
  }
}

async function getInfoOfIp(searchUrl) {
  const response = await fetch(
    `${url}/connect/info?url=${searchUrl.replace(/\/$/gm, '')}`,
    {
      method: 'GET',
      redirect: 'follow',
    },
  ).then((data) => data.json());

  return response;
}

function addLog(message, type, title) {
  switch (type) {
    case 'error':
      logsBox.innerHTML += `<div class="test pading-1 box-display-left">
        <div class="error">[Error - ${moment().format('LTS')}]: </div>
        <div>${message}</div>
        </div>`;
      break;

    case 'warning':
      logsBox.innerHTML += `<div class="test pading-1 box-display-left">
          <div class="warning">[WARNING - ${moment().format('LTS')}]: </div>
          <div>${message}</div>
          </div>`;
      break;

    default:
      logsBox.innerHTML += `<div class="test pading-1 box-display-left">
          <div class="log">[LOG - ${moment().format('LTS')}]: </div>
          <div>${message}</div>
          </div>`;
      break;
  }
}

testConnection(url);
chartCominSoon('upd');

checkBrowser.onclick = async () => {
  flag = !flag;

  checkBrowser.classList.add(`${flag ? 'active' : 'disactive'}`);
  checkBrowser.classList.remove(`${flag ? 'disactive' : 'active'}`);

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

  if (flag) moveOnBrowser(searchString.value);
  else moveOffBrowser(searchString.value);
};

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

  if (flag) moveOnBrowser(searchString.value);
  else moveOffBrowser(searchString.value);
};

setInterval(() => {
  testConnection(url);
}, 60000);

addLog('Start normal');
