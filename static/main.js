const flag = false;
const socket = io();
const url = 'https://monitor-for.herokuapp.com/';

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

async function testConnection(url, selector = '.indecator.http') {
  const indecator = document.querySelector(selector);

  try {
    await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
  } catch (err) {
    connectSucceful(indecator, false);
  }

  connectSucceful(indecator);
}

async function getInfoOfIp(searchUrl) {
  const response = await fetch(`${url}/connect/info?url=${searchUrl}`, {
    method: 'GET',
    redirect: 'follow',
  }).then((data) => data.json());

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

setInterval(() => {
  testConnection(url);
});
