let dealersScore = 0;
let playersScore = 0;
let dealersHand = [];
let playersHand = [];
let deckID = null;

document.getElementById("startGame").addEventListener("click", function(event) {
   dealersScore = 0;
   playersScore = 0;
   document.getElementById("rules-container").style.display = "none";
   document.getElementById("dealersScore").style.display = "inline-block";
   document.getElementById("playersScore").style.display = "inline-block";
   document.getElementById("playersParent").style.display = "inline-block";
   startRound();
});

function startRound () {
   dealersHand = [];
   playersHand = [];
   document.getElementById("dealersScore").innerHTML = "<h2>Dealer<br><hr>" + dealersScore + "</h2>";
   document.getElementById("playersScore").innerHTML = "<h2>Player<br><hr>" + playersScore + "</h2>";

   // Create new deck
   const url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=3";
   fetch(url)
      .then(function(response) {
         return response.json();
      }).then(function(json) {
         deckID = json.deck_id;

         // Set up board
         const url2 = "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=3";
         fetch(url2)
            .then(function(response) {
               return response.json();
            }).then(function(json) {
               let dealersCards = "<img class='card1' src='images/cardback.png'/>";
               dealersCards += "<img class='card2' src='" + json.cards[0].image + "'/>";
               dealersHand.push("0");
               dealersHand.push(json.cards[0].value);

               let playersCards = "<img class='card1' src='" + json.cards[1].image + "'/>";
               playersCards += "<img class='card2' src='" + json.cards[2].image + "'/>";
               playersHand.push(json.cards[1].value);
               playersHand.push(json.cards[2].value);

               document.getElementById("dealersCards").innerHTML = dealersCards;
               document.getElementById("hit").style.display = "inline-block";
               document.getElementById("stand").style.display = "inline-block";
               document.getElementById("playersCards").innerHTML = playersCards;
               document.getElementById("dealersHandTotal").innerHTML = "(" + calcHandTotal(dealersHand) + ")";
               document.getElementById("playersHandTotal").innerHTML = "(" + calcHandTotal(playersHand) + ")";

               addjustSpacing();
            });
      });
}

document.getElementById("hit").addEventListener("click", function(event) {
   // Hit
   const url = "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1";
   fetch(url)
      .then(function(response) {
         return response.json();
      }).then(function(json) {
         playersHand.push(json.cards[0].value);
         let results = document.getElementById("playersCards").innerHTML;
         results += "<img class='card" + playersHand.length + "' src='" + json.cards[0].image + "'/>";

         document.getElementById("playersCards").innerHTML = results;
         document.getElementById("playersHandTotal").innerHTML = "(" + calcHandTotal(playersHand) + ")";

         addjustSpacing();

         if (calcHandTotal(playersHand) > 21) {
            dealersScore++;
            setTimeout(() => {
               messageBox("Bust! <br>Dealer Scores!");
            }, 200);
         }
      });
});

document.getElementById("stand").addEventListener("click", function(event) {

   document.getElementById("hit").style.display = "none";
   document.getElementById("stand").style.display = "none";

   const url = "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1";
   fetch(url)
      .then(function(response) {
         return response.json();
      }).then(function(json) {
         // Remove Blank Card
         let div = document.getElementById("dealersCards");
         div.removeChild(div.childNodes[0]);
         dealersHand.shift();

         // Add new card
         let results = "<img class='card1' src='" + json.cards[0].image + "'/>";
         results += document.getElementById("dealersCards").innerHTML;
         dealersHand.push(json.cards[0].value);

         document.getElementById("dealersCards").innerHTML = results;
         document.getElementById("dealersHandTotal").innerHTML = "(" + calcHandTotal(dealersHand) + ")";

         addjustSpacing();

         if (calcHandTotal(dealersHand) > 21) {
            playersScore++;
            setTimeout(() => {
               messageBox("Dealer Busts! <br>You Score!");
            }, 1000);
         } else if(calcHandTotal(dealersHand) < 17) {
            setTimeout(() => {
               dealerHit();
            }, 1000);

         } else {
            determinWinner();
         }

      });
});

function dealerHit() {
   const url = "https://deckofcardsapi.com/api/deck/" + deckID + "/draw/?count=1";
   fetch(url)
      .then(function(response) {
         return response.json();
      }).then(function(json) {
         // Add new card
         dealersHand.push(json.cards[0].value);
         let results = document.getElementById("dealersCards").innerHTML;
         results += "<img class='card" + dealersHand.length + "' src='" + json.cards[0].image + "'/>";

         document.getElementById("dealersCards").innerHTML = results;
         document.getElementById("dealersHandTotal").innerHTML = "(" + calcHandTotal(dealersHand) + ")";

         addjustSpacing();

         // Player scores if over 21
         if (calcHandTotal(dealersHand) > 21) {
            playersScore++;
            setTimeout(() => {
               messageBox("Dealer Busts! <br>You Score!");
            }, 1000);
         // Dealer hits if still under 17
         } else if (calcHandTotal(dealersHand) < 17) {
            setTimeout(() => {
               dealerHit();
            }, 1000);
         // Highest score wins
         } else {
            determinWinner();
         }
      });
}

function determinWinner() {
   if (calcHandTotal(dealersHand) > calcHandTotal(playersHand)) {
      dealersScore++;
      setTimeout(() => {
         messageBox("Dealer is Higher! <br>Dealer Scores!");
      }, 1000);
   } else if (calcHandTotal(dealersHand) < calcHandTotal(playersHand)){
      playersScore++;
      setTimeout(() => {
         messageBox("You are Higher! <br>You Score!");
      }, 1000);
   } else {
      setTimeout(() => {
         messageBox("It's a Tie! <br>Nobody Scores");
      }, 1000);
   }
}

function calcHandTotal(hand) {
   let total = 0;
   let numAces = 0
   for (let i = 0; i < hand.length; i++) {
      if (hand[i] == "KING" || hand[i] == "QUEEN" || hand[i] == "JACK") {
         total += 10;
      } else if (hand[i] == "ACE") {
         numAces++;
         total += 11;
      } else {
         total += parseInt(hand[i]);
      }
   }
   // Ace value is worth 1 instead of 11 if it went over 21
   while (total > 21 && numAces-- > 0) {
      total -= 10;
   }
   return total;
}

function addjustSpacing () {
   if (window.innerWidth < 800) {
      let pTotalDistance = (playersHand.length - 1) * 40;
      let dTotalDistance = (dealersHand.length - 1) * 40;
      document.getElementById("playersParent").style.paddingRight = pTotalDistance + "px";
      document.getElementById("dealersParent").style.paddingRight = dTotalDistance + "px";
   } else {
      document.getElementById("playersParent").style.paddingRight = "0px";
      document.getElementById("dealersParent").style.paddingRight = "0px";
   }
}


// Message Box
var modal = document.getElementById("myModal");
var span = document.getElementsByClassName("close")[0];

function messageBox(message) {
   document.getElementById("message").innerHTML = message;
   modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  startRound();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    startRound();
  }
}
