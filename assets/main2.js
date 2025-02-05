// Define minimum fee
let min_fee = 5;

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

async function getPHPExchangeRate() {
    let json = await fetch(
        "https://latest.currency-api.pages.dev/v1/currencies/usd.json"
    );
    let a = await json.json();
    return a.usd.php;
}

// Function to calculate currency conversion
async function calc(from, to, amount) {
    let x = data.find((a) => a.from.includes(from) && a.to.includes(to));

    if (to == "PHP") {
        let fee = x.calc(amount) * amount > min_fee ? x.calc(amount) * amount : min_fee;
        let b = await getPHPExchangeRate();
        return b * (amount - fee);
    } else if (to == "UPI") {
        return x.calc(amount);
    }

    let fee = x.calc(amount) * amount > min_fee ? x.calc(amount) * amount : min_fee;
    return amount - fee;
}

// Event listeners and DOM manipulation for frontend interaction
document.addEventListener("DOMContentLoaded", function () {
    var cursor = document.querySelector(".cursor");
    var cursorinner = document.querySelector(".cursor2");
    var a = document.querySelectorAll("a");
    var span = document.querySelectorAll("span");

    document.addEventListener("mousemove", function (e) {
        cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
        cursorinner.style.left = e.clientX + "px";
        cursorinner.style.top = e.clientY + "px";
    });

    document.addEventListener("mousedown", function () {
        cursor.classList.add("click");
        cursorinner.classList.add("cursorinnerhover");
    });

    document.addEventListener("mouseup", function () {
        cursor.classList.remove("click");
        cursorinner.classList.remove("cursorinnerhover");
    });

    var b = document.querySelector("#copy");
    b.addEventListener("mouseover", () => {
        cursor.classList.add("hover");
    });
    b.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover");
    });

    a.forEach((item) => {
        item.addEventListener("mouseover", () => {
            cursor.classList.add("hover");
        });
        item.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
        });
    });

    const calcBtn = document.querySelector(
        "button.bg-white.text-black.w-full.py-2.border.border-white\\/50.rounded-lg.active\\:scale-90.active\\:transition.active\\:delay-75"
    );

    let selectedFrom = null;
    let selectedTo = null;

    // Listen for user clicks on "exchangeOptions"
    document
        .querySelectorAll("#exchangeOptions button[data-from]")
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                selectedFrom = btn.getAttribute("data-from");
                selectedTo = "Crypto";
            });
        });

    // Listen for user clicks on "fromCryptoDiv"
    document
        .querySelectorAll("#fromCryptoDiv button[data-to]")
        .forEach((btn) => {
            btn.addEventListener("click", () => {
                selectedFrom = "Crypto";
                selectedTo = btn.getAttribute("data-to");
            });
        });

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
});
