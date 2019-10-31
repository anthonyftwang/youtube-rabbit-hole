chrome.storage.sync.get("hideHomePage", function(result) {
    var hideHomePage = result.hideHomePage;
    randQuote = chooseQuote();
    window.setInterval(function() {
        var frontAd = document.querySelector("ytd-banner-promo-renderer");
        if (frontAd) {
            frontAd.innerHTML = "";
        }
        var frontVideoAd = document.querySelector("ytd-video-masthead-ad-v3-renderer");
        if (frontVideoAd) {
            frontVideoAd.innerHTML = "";
        }
        if (hideHomePage == true) {
    
            var safe = true // TODO - improve handling of orphaned script -> chrome.runtime.getURL
            try {
                var magicBunny = renderMagic();
            }
            catch {
                safe = false
            }
    
            var recs = document.querySelector("ytd-section-list-renderer");
            if (recs && safe) {
                recs.innerHTML = "";
                recs.appendChild(magicBunny);
                recs.appendChild(renderQuote(randQuote));
            }
            var recs2 = document.querySelector("ytd-rich-grid-renderer");
            if (recs2 && safe) {
                recs2.innerHTML = "";
                recs2.appendChild(magicBunny);
                recs2.appendChild(renderQuote(randQuote));
            }
        }
    }, 100);
});

function chooseQuote() {
    var quotes = [
        "\"There is magic, but you have to be the magician. You have to make the magic happen.\"",
        "\"Real magic is not about gaining power over others: it is about gaining power over yourself.\"",
        "\"The world is full of magic things, patiently waiting for our senses to grow sharper.\""
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function renderMagic() {
    var magic = document.createElement("img");
    magic.src = chrome.runtime.getURL("images/magicbunny.png");
    magic.width = 325;
    magic.height = 414;
    magic.style.display = "block";
    magic.style.marginLeft = "auto";
    magic.style.marginRight = "auto";
    magic.style.marginTop = "25px";
    return magic;
}

function renderQuote(quote) {
    var span = document.createElement("span");
    span.style.display = "block";
    span.style.marginLeft = "auto";
    span.style.marginRight = "auto";
    span.style.marginTop = "25px";
    span.style.color = "#282828";
    span.style.fontFamily = "Roboto, Arial, sans-serif";
    span.style.fontSize = "1.4rem";
    span.style.fontWeight = "400";
    span.style.lineHeight = "2.1rem";
    span.appendChild(document.createTextNode(quote));
    return span;
}