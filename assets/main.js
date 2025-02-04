// Last Modified: Sun, 02/02/2025 15:18 Malaysia Time
// all changed are made in main2.js just in case you want to compare the changes
// explanation of each code is AI generated but the code is written by half ai half me

let min_fee = 5;
let data = [
  {
    from: ["Wise", "Revolut", "Skrill"],
    to: ["Crypto"],
    calc: (amt) => {
      if (amt >= 500) return 0.05;
      if (amt >= 250) return 0.06;
      return 0.07;
    },
  },
  {
    from: ["Crypto"],
    to: ["Crypto"],
    calc: (amt) => {
      if (amt >= 1000) return 0.01;
      if (amt >= 500) return 0.02;
      return 0.03;
    },
  },
  {
    from: ["Crypto"],
    to: ["Wise", "Revolut", "Skrill", "Cashapp", "Zelle", "Bank Transfer"],
    calc: (amt) => {
      if (amt >= 1000) return 0.04;
      if (amt >= 500) return 0.05;
      if (amt >= 250) return 0.06;
      return 0.07;
    },
  },
  {
    from: ["Crypto"],
    to: ["UPI"],
    calc: (amt) => {
      if (amt >= 100) return 88 * amt;
      return 87 * amt;
    },
  },
  {
    from: ["Crypto"],
    to: ["PHP"],
    calc: (amt) => {
      if (amt >= 1000) {
        return 0.05;
      } else if (amt >= 500) {
        return 0.06;
      } else {
        return 0.07;
      }
    },
  },
];

async function getPHPExchangeRate() {
  let json = await fetch(
    "https://latest.currency-api.pages.dev/v1/currencies/usd.json"
  );
  let a = await json.json();
  return a.usd.php;
}

async function calc(from, to, amount) {
  let x = data.find((a) => a.from.includes(from) && a.to.includes(to));

  if (to == "PHP") {
    let a =
      x.calc(amount) * amount > min_fee
        ? Number((amount - x.calc(amount) * amount).toFixed(2))
        : amount - min_fee;
    let b = await getPHPExchangeRate();
    return b * a;
  } else if (to == "UPI") {
    return x.calc(amount);
  }

  return x.calc(amount) * amount > min_fee
    ? Number((amount - x.calc(amount) * amount).toFixed(2))
    : amount - min_fee;
}

var cursor = document.querySelector(".cursor");
var cursorinner = document.querySelector(".cursor2");
var a = document.querySelectorAll("a");
var span = document.querySelectorAll("span");

document.addEventListener("mousemove", function (e) {
  var x = e.clientX;
  var y = e.clientY;
  cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
});

document.addEventListener("mousemove", function (e) {
  var x = e.clientX;
  var y = e.clientY;
  cursorinner.style.left = x + "px";
  cursorinner.style.top = y + "px";
});

document.addEventListener("mousedown", function () {
  cursor.classList.add("click");
  cursorinner.classList.add("cursorinnerhover");
});

document.addEventListener("mouseup", function () {
  cursor.classList.remove("click");
  cursorinner.classList.remove("cursorinnerhover");
});

// Listen for user clicks on "exchangeOptions"
document
  .querySelectorAll("#exchangeOptions button[data-from]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedFrom = btn.getAttribute("data-from");
      selectedTo = "Crypto";
      document.querySelectorAll("#exchangeOptions button").forEach((b) => {
        b.classList.remove("focus-style");
      });
      btn.classList.add("focus-style");
    });
  });

// Listen for user clicks on "fromCryptoDiv"
document.querySelectorAll("#fromCryptoDiv button[data-to]").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedFrom = "Crypto";
    selectedTo = btn.getAttribute("data-to");
    document.querySelectorAll("#fromCryptoDiv button").forEach((b) => {
      b.classList.remove("focus-style");
    });
    btn.classList.add("focus-style");
  });
});

// Ensure calcBtn is selected correctly
const calcBtn = document.querySelector("button.bg-white");

calcBtn.addEventListener("click", async () => {
  if (!selectedFrom || !selectedTo) return;
  const amountInput = document.querySelector('input[placeholder="$0"]');
  if (!String(amountInput.value).length) return;

  let receiveAmt = await calc(
    selectedFrom,
    selectedTo,
    Number(amountInput.value)
  );
  let resultEl = document.querySelector("p.text-[20pt].font-bold.text-center");
  resultEl.textContent = `$${receiveAmt.toFixed(2)}`;
  document.getElementById("receiveCurrency").textContent = `in ${selectedTo}`;
});
