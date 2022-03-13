$(() => {

  local_storage();
  setTimeout(() => {
    getAjax();
  },100);

  get_page('pages/main.html');

  $('#home').click(function(e){
    e.preventDefault();
    get_page('pages/main.html');
    getAjax();
  });

  $('#reports').click(function(e){
    e.preventDefault();
    get_page('pages/reports.html');
    setTimeout(() => {
      display_Chart();
    }, 100);
  });
});

function get_page(path){
  $('.content').load(path);
}

var myInterval;
var currencyArray = [];
var coinArray = [];

async function getAjax(){
 
  try{
    let coins = await get_all_coins();
    coins_display(coins);
    coin_details_display();
    checked_inputs();

    $("#coin_search-text").keyup(function () {
      coin_search($(this).val());
    });
  }
  catch(err){
    alert(alert(err.messge + "error getAjax"));
  }
}

const dataFromServer = (url) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: url,
      success: coins => resolve(coins),
      error: err => reject(alert("Error in API" + err.messge)),
    });
  });
}

///Get all coins
function get_all_coins() {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "GET",
      url: `https://api.coingecko.com/api/v3/coins/list`,
      beforeSend: () => $('.progress').append(`<div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 100%;"></div>`),
      success: coins => resolve(coins),
      error: err => reject(alert("Error in API" + err.messge)),
      complete: ()=> $('.progressDiv').hide(),
    });
  });
}


function coins_display(coins) {

  $("#home-content").html("");
  let ck_coins = JSON.parse(localStorage.getItem("ck_coins"));
  for(let coin of coins){
    ///Check the coin name in the local storge and make the input checked;
    const checkCoinInArray = ck_coins.find(c => c === coin.symbol);

    $("#home-content").append(`
    <div class="card col col-12 col-sm-12	col-md-4	col-lg-4 col-xl-3	col-xxl-3">
      <h6 class="card-header">${coin.symbol}
        <div class="form-check form-switch">
        ${ checkCoinInArray 
          ?
          `<input class="form-check-input" checked type="checkbox" id="${coin.symbol}" name="${coin.symbol}">`
          :
          `<input class="form-check-input" type="checkbox" id="${coin.symbol}" name="${coin.symbol}">`
        }
        </div>
      </h6>
      <div class="card-body">
        <p class="card-title">${coin.name}</p>
        <button data-id="#details-${coin.id}" data-toggled="false" data-coin="${coin.id}"class="btn btn-primary btn-toggle">More info</button>
        <div id="details-${coin.id}"></div>
      </div>
    </div>`);
  }
}

setInterval(() => {
  return coinsChart = () => {
  
    return new Promise((resolve, reject) => {
      var coins = JSON.parse(localStorage.getItem("ck_coins"));
      $.ajax({
        type: 'GET',
        url :`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coins}&tsyms=USD`,
        success: coin => resolve(coin),
        error: err => reject(err),
      });
    });
  }
}, 1000);



const display_Chart = async () => {
  const data = await coinsChart();
  for(let prop in data) {
    currencyArray.push(data[prop].USD);
    coinArray.push(prop);
  }
  var options = {
    animationEnabled: true,  
    title:{
      text: "Cryptocurrency Prices"
    },
    axisX: {
      valueFormatString: "-",
    },
    axisY: {
      prefix: "$"
    },
    toolTip:{
      shared:true
    },  
    data: [{
      yValueFormatString: "$######",
      type: "stepArea",
      dataPoints: [
        { label: coinArray[0], y: currencyArray[0] },	
        { label: coinArray[1], y: currencyArray[1]},
        { label: coinArray[2], y: currencyArray[2]},
        { label: coinArray[3], y: currencyArray[3]},
        { label: coinArray[4], y: currencyArray[4]}
      ]
    }]
  }
  $("#myChart").CanvasJSChart(options);
}


///Search coins
async function coin_search(keyword) {
  try {
    let coins = await get_all_coins();
    coins = coins.filter((coin) => coin.symbol.includes(keyword));
    coins_display(coins);
    coin_details_display();
    checked_inputs();
  }
  catch(err) {
    alert("Error:" + err);
  }
}



///Function to display the details of each coin
function coin_details_display() {
  $(".btn-toggle").click(async function () {
    if ($(this).data("toggled") === false) { 
      $(this).data("toggled", true);
      $($(this).data("id")).html(`
        <div class="p-3">Please Wait.....
            <div class="progress p-0" id ="progressinfo">
                <div 
                    class="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" style="width: 100%" 
                    aria-valuemax="100">
                </div>
            </div>
        </div>`);
      let thisCoin = $(this).data("coin");
      const coin = await dataFromServer(`https://api.coingecko.com/api/v3/coins/${thisCoin}`);
     
      $($(this).data("id")).html(`
        <div class="coinDetails">
         <img src="${coin.image.small}">
          <div>${coin.market_data.current_price.usd} $</div>
          <div> ${coin.market_data.current_price.eur} €</div>
          <div>${coin.market_data.current_price.sek} ₪</div>
        </div>`);
    }else {
      $(this).data("toggled", false);
      $($(this).data("id")).html('');
    }
  });
}


// Show modal with checked coins
function show_modal(coins) {
  $("#modal-body-coins").html("");
  coins.forEach(function (coin) {
    $("#modal-body-coins").append(`<p  class="list-inline-item">${coin.toUpperCase()}<p>
        <button class="btn btn-danger coin-remove" data-target="${coin}">Remove</button>`);
  });
}


////LocalStorage
function local_storage() {
  if(localStorage.getItem("ck_coins")) {
   return localStorage.getItem("ck_coins");
  }
  localStorage.setItem("ck_coins", "[]");
}


//// Checked Inputs function to check if i select more than 5 coin it well show the modal
function checked_inputs() {
  $(".form-check-input").click(function () {
    let ck_coins = JSON.parse(localStorage.getItem("ck_coins"));
    const checkCoinInArray = ck_coins.find(coin => coin === this.name);

    if (ck_coins.length >= 5) {
      setTimeout(() => {
        $(this)[0].checked = false;
      }, 100);
      show_modal(ck_coins)
          $("#removeCoinModal").modal("show");    
          $(".coin-remove").click(function () {
            ck_coins = ck_coins.filter((coin) => coin != $(this).data("target"));
            $( "#" + $(this).data("target"))[0].checked = false;
            $("#removeCoinModal").modal("hide");
            localStorage.setItem("ck_coins", JSON.stringify(ck_coins));
            
        });
    }else {
      if(checkCoinInArray) {
        $(this)[0].checked = false;
        return;
      }
      if($(this)[0].checked === true) {
        ck_coins.push($(this)[0].name);
      } else {
        ck_coins = ck_coins.filter((coin) => coin != $(this)[0].name);
      }
      localStorage.setItem("ck_coins", JSON.stringify(ck_coins, $(this)[0].name));
    }
  });
}
