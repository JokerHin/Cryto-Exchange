/***************************************************************
 * Configuration & Data
 ***************************************************************/

// Minimum fee in USD for certain exchanges
let MIN_FEE = 5;

// Rules that map "from" → "to" with a fee calculation function
let exchangeRules = [
    {
        from: ["Wise", "Revolut", "Skrill"],
        to: ["Crypto"],
        calcFeeRate(amount) {
            if (amount >= 500) return 0.05;
            if (amount >= 250) return 0.06;
            return 0.07;
        },
    },
    {
        from: ["Crypto"],
        to: ["Crypto"],
        calcFeeRate(amount) {
            if (amount >= 1000) return 0.01;
            if (amount >= 500) return 0.02;
            return 0.03;
        },
    },
    {
        from: ["Crypto"],
        to: ["Wise", "Revolut", "Skrill", "Cashapp", "Zelle", "Bank Transfer"],
        calcFeeRate(amount) {
            if (amount >= 1000) return 0.04;
            if (amount >= 500) return 0.05;
            if (amount >= 250) return 0.06;
            return 0.07;
        },
    },
    {
        from: ["Crypto"],
        to: ["UPI"],
        /**
         * For UPI, returning direct multiplication
         * (88 * amt or 87 * amt), not a percentage
         */
        calcFeeRate(amount) {
            return amount >= 100 ? 88 * amount : 87 * amount;
        },
    },
    {
        from: ["Crypto"],
        to: ["PHP"],
        calcFeeRate(amount) {
            if (amount >= 1000) return 0.05;
            if (amount >= 500) return 0.06;
            return 0.07;
        },
    },
];

/***************************************************************
 * Helper Functions
 ***************************************************************/

/**
 * Fetches the PHP exchange rate for 1 USD from a remote API.
 * Returns a numeric exchange rate (e.g. 56.5).
 */
async function fetchPHPExchangeRate() {
    let response = await fetch(
        "https://latest.currency-api.pages.dev/v1/currencies/usd.json"
    );
    let data = await response.json();
    return data.usd.php; // The JSON should have { "usd": { "php": <rate> } }
}

/**
 * Main function to calculate how much the user receives after fees.
 *
 * @param {string} from   - Source currency/provider (e.g. "Crypto", "Wise", etc.)
 * @param {string} to     - Destination currency/provider (e.g. "PHP", "UPI", etc.)
 * @param {number} amount - How much the user is sending
 * @returns {number}      - The final amount after fees (in the correct currency)
 */
async function calculateExchange(from, to, amount) {
    // Find the matching rule
    let rule = exchangeRules.find(
        (r) => r.from.includes(from) && r.to.includes(to)
    );

    if (!rule) {
        console.warn(`No exchange rule found for ${from} → ${to}`);
        return amount; // Or return 0, or throw an error
    }

    // Special handling for 'UPI' because it's a direct multiplication
    if (to === "UPI") {
        return rule.calcFeeRate(amount);
    }

    // Special handling for 'PHP' because we need an exchange rate
    if (to === "PHP") {
        let feeRate = rule.calcFeeRate(amount);
        // If feeRate is a percentage, the fee = (feeRate * amount)
        // Subtract either that or MIN_FEE, whichever is larger
        let afterFee =
            feeRate * amount > MIN_FEE
                ? Number((amount - feeRate * amount).toFixed(2))
                : amount - MIN_FEE;

        let phpRate = await fetchPHPExchangeRate();
        return phpRate * afterFee;
    }

    // Default flow for other "to" currencies/providers
    let feeRate = rule.calcFeeRate(amount);
    let totalFee = feeRate * amount;
    if (totalFee > MIN_FEE) {
        return Number((amount - totalFee).toFixed(2));
    }
    return amount - MIN_FEE;
}

/***************************************************************
 * Cursor Effects & UI Interactions
 ***************************************************************/

// Custom cursor elements
let cursor = document.querySelector(".cursor");
let cursorinner = document.querySelector(".cursor2");

// Generic function to handle all anchor or span-like hovers
function addHoverEffectOnElements(elementList) {
    elementList.forEach((el) => {
        el.addEventListener("mouseover", () => {
            cursor.classList.add("hover");
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
        });
    });
}

// Track mouse movement to position custom cursors
document.addEventListener("mousemove", (e) => {
    cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    cursorinner.style.left = `${e.clientX}px`;
    cursorinner.style.top = `${e.clientY}px`;
});

// Add click effects
document.addEventListener("mousedown", () => {
    cursor.classList.add("click");
    cursorinner.classList.add("cursorinnerhover");
});

document.addEventListener("mouseup", () => {
    cursor.classList.remove("click");
    cursorinner.classList.remove("cursorinnerhover");
});

// Enable hover effect on the #copy button
let copyBtn = document.querySelector("#copy");
copyBtn.addEventListener("mouseover", () => cursor.classList.add("hover"));
copyBtn.addEventListener("mouseleave", () => cursor.classList.remove("hover"));

// Enable hover effect on all <a> elements
let anchorElements = document.querySelectorAll("a");
addHoverEffectOnElements(anchorElements);

/***************************************************************
 * Exchange Calculation: Event Handlers
 ***************************************************************/

let selectedFrom = null;
let selectedTo = null;

// Buttons from "exchangeOptions" (e.g. Wise/Revolut/Skrill → Crypto)
document.querySelectorAll("#exchangeOptions button[data-from]").forEach((btn) => {
    btn.addEventListener("click", () => {
        selectedFrom = btn.getAttribute("data-from");
        selectedTo = "Crypto";
    });
});

// Buttons from "fromCryptoDiv" (e.g. Crypto → {Wise, Revolut, Skrill, UPI, etc.})
document.querySelectorAll("#fromCryptoDiv button[data-to]").forEach((btn) => {
    btn.addEventListener("click", () => {
        selectedFrom = "Crypto";
        selectedTo = btn.getAttribute("data-to");
    });
});

// Calculate button
let calcBtn = document.querySelector(
    "button.bg-white.text-black.w-full.py-2.border.border-white\\/50.rounded-lg.active\\:scale-90.active\\:transition.active\\:delay-75"
);
calcBtn.addEventListener("click", async () => {
    if (!selectedFrom || !selectedTo) {
        console.warn("Must select both from and to currencies/providers");
        return;
    }

    let amountInput = document.querySelector('input[placeholder="$0"]');
    if (!amountInput.value.trim()) {
        console.warn("Amount is empty or invalid");
        return;
    }

    let amount = parseFloat(amountInput.value);
    let receivedAmount = await calculateExchange(selectedFrom, selectedTo, amount);

    // Display result to the user
    let resultEl = document.querySelector("p.text-[20pt].font-bold.text-center");
    resultEl.textContent = `$${receivedAmount.toFixed(2)}`;

    // Also update currency label
    document.getElementById("receiveCurrency").textContent = `in ${selectedTo}`;
});
