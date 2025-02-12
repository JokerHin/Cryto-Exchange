// Constants and Variables
// WARNING: These variables are in global scope - be careful of naming conflicts
let min_fee = 5;
let selectedFrom = null;
let selectedTo = null;

// Define currency exchange data
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

/*

// Store exchange rates globally
let exchangeRates = {};

// Fetch exchange rates from API
async function getExchangeRates() {
    try {
        const response = await fetch("https://latest.currency-api.pages.dev/v1/currencies/usd.json");
        const data = await response.json();
        exchangeRates = data.usd;
        // Update exchange rate display
        document.querySelector('#exchangeRate').textContent = `1 USD = ${exchangeRates.eur?.toFixed(4) || 'N/A'} EUR`;
    } catch (error) {
        console.error('Error fetching rates:', error);
    }
}

// Initialize exchange rates
getExchangeRates();

*/



// Calculation Function
// NOTICE: This function assumes specific HTML structure exists
async function calc(from, to, amount) {
    // Make sure amount is validated before passing to this function
    if (!amount || isNaN(amount)) {
        console.error('Invalid amount provided');
        return 0;
    }

    // Find matching exchange rate data
    let x = data.find((a) => a.from.includes(from) && a.to.includes(to));
    if (!x) {
        console.error('No exchange rate found for given currencies');
        return 0;
    }

    // Special handling for PHP and UPI
    if (to == "PHP") {
        let a = x.calc(amount) * amount > min_fee
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

calc();

const x = data.find(a => a.from.includes(from) && a.to.includes(to));
if (!x) return 0;

let fee = x.calc(amount) * amount;
fee = fee > min_fee ? fee : min_fee;

if (to === "PHP") {
    const rate = exchangeRates.php || await getPHPExchangeRate();
    return rate * (amount - fee);
}

if (to === "UPI") return x.calc(amount);

return amount - fee;


// Maintain PHP rate compatibility
async function getPHPExchangeRate() {
    await getExchangeRates();
    return exchangeRates.php;
}

const calcBtn = document.getElementById("calculateBtn");

// Event Listeners Section
// CAUTION: There are currently two similar event listeners for #exchangeOptions
// This causes duplicate handlers - should remove one of these blocks
document.querySelectorAll("#exchangeOptions button[data-from]").forEach((btn) => {
    btn.addEventListener("click", () => {
        // First implementation with focus-style
        selectedFrom = btn.getAttribute("data-from");
        selectedTo = "Crypto";
        document.querySelectorAll("#exchangeOptions button").forEach((b) => {
            b.classList.remove("focus-style");
        });
        btn.classList.add("focus-style");
    });
});

// TODO: Remove this duplicate event listener
document.querySelectorAll("#exchangeOptions button[data-from]").forEach(btn => {
    btn.addEventListener("click", () => {
        // Second implementation without focus-style
        selectedFrom = btn.dataset.from;
        selectedTo = "Crypto";
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


