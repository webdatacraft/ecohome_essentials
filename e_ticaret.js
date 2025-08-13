// Sepeti ve favorileri yükle
// DOM içeriği yüklendikten sonra çalışacak ana blok
document.addEventListener('DOMContentLoaded', function () {
    // Sepet ve favori verilerini LocalStorage'dan al
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let favoriteItems = JSON.parse(localStorage.getItem("favorites")) || [];

    // Sayfa yüklendiğinde sepeti ve favorileri yükle
    loadCart();
    loadFavorites();
    updateFavoriteCount();
    updateFavoriteContainer();
    updateScrollProgress(); // Scroll butonunu başlangıçta kontrol et
    
    // === DOM Elementleri ===
    const addToCartButtons = document.querySelectorAll(".btn");
    const cartBtn = document.querySelector("#cart-btn");
    const cartItem = document.querySelector(".cart-items-container");
    const favoriteButtons = document.querySelectorAll(".favorite-btn");
    const favoriteContainer = document.getElementById("favorite-container");
    const favoriteCount = document.getElementById("favorite-count");
    const tumUrunlerButonu = document.getElementById("btn-tum-urunler");
    const scrollBtn = document.getElementById("scrollToTopBtn");
    const hamburger = document.getElementById("hamburger");
    const nav = document.querySelector(".nav");
    const stars = document.querySelector(".bambu-detay-stars");

    // --- Event Listener'lar ---

    // 'Sepete Ekle' butonlarına tıklama
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", function (event) {
            // Sadece sepet veya favori butonları için engelle
            if (
                button.classList.contains("cart-btn") ||
                button.classList.contains("favorite-btn")
            ) {
                // Eğer butona favoriye ekleme tıklanmışsa, sepeti etkileme
                if (button.classList.contains("favorite-btn")) {
                    return;
                }
                event.preventDefault();

                let productName, productPrice, productImage;

                // Menü kısmındaki ürünler için veri çekme
                if (button.closest(".menu")) {
                    const productBox = button.closest(".box");
                    productName = productBox.querySelector("h3").textContent;
                    productPrice = productBox
                        .querySelector(".price")
                        .textContent.trim()
                        .split(" ")[0];
                    productImage = productBox.querySelector("img").src;
                }

                // Ürünler kısmındaki ürünler için veri çekme
                else if (button.closest(".products")) {
                    productName = button.getAttribute("data-name");
                    productPrice = button.getAttribute("data-price");
                    productImage = button.getAttribute("data-image");
                }
                // Ürün detay sayfaları için veri çekme
                else if (button.closest(".bambu-detay-container")) {
                    const details = button.closest(".details") || button.closest(".card");
                    if (details) {
                        const h3 = details.querySelector("h3");
                        if (h3) productName = h3.textContent.trim();
                        const h2 = details.querySelector("h2");
                        if (h2) productPrice = h2.textContent.trim();
                        const img = details.querySelector("img");
                        if (img) productImage = img.src;
                    }
                    if (button.getAttribute("data-name"))
                        productName = button.getAttribute("data-name");
                    if (button.getAttribute("data-price"))
                        productPrice = button.getAttribute("data-price");
                    if (button.getAttribute("data-image"))
                        productImage = button.getAttribute("data-image");
                }

                if (!productName || !productPrice || !productImage) {
                    console.error("Ürün bilgileri eksik!");
                    return;
                }

                const productId = productName.toLowerCase().trim();
                const existingProduct = cart.find((item) => item.id === productId);

                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    const product = {
                        id: productId,
                        name: productName,
                        price: productPrice,
                        image: productImage,
                        quantity: 1,
                    };
                    cart.push(product);
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                loadCart();
            }
        });
    });

    // Sepet butonuna tıklama işlemi
    if (cartBtn && cartItem) {
        cartBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            if (favoriteContainer && favoriteContainer.classList.contains("active")) {
                favoriteContainer.classList.remove("active");
            }
            cartItem.classList.toggle("active");
        });
    }

    // Favori butonuna tıklama işlemi
    if (favoriteButtons) {
        favoriteButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const productName = button.getAttribute("data-name");
                const productPrice = button.getAttribute("data-price");
                const productImage = button.getAttribute("data-image");

                if (productName && productPrice && productImage) {
                    const exists = favoriteItems.some((item) => item.name === productName);
                    if (!exists) {
                        favoriteItems.push({
                            name: productName,
                            price: productPrice,
                            image: productImage,
                        });
                        localStorage.setItem("favorites", JSON.stringify(favoriteItems));
                        updateFavoriteContainer();
                        updateFavoriteCount();
                        const heartIcon = document.querySelector(".heart-icon");
                        if (heartIcon) {
                            heartIcon.classList.add("active");
                        }
                    } else {
                        alert("Bu ürün zaten favorilerinizde!");
                    }
                }
            });
        });
    }

    // Menüdeki kalp (favori) ikonuna tıklanınca favori kutusunu aç/kapat
    const favoriteBtn = document.getElementById("favorite-btn");
    const favoriteContainerDiv = document.getElementById("favorite-container");
    if (favoriteBtn && favoriteContainerDiv) {
        favoriteBtn.addEventListener("click", function (event) {
            event.stopPropagation();
            if (cartItem && cartItem.classList.contains("active")) {
                cartItem.classList.remove("active");
            }
            favoriteContainerDiv.classList.toggle("active");
        });

        const closeFavBtn = document.querySelector(".close-fav-btn");
        if (closeFavBtn) {
            closeFavBtn.addEventListener("click", function () {
                favoriteContainerDiv.classList.add("closing");
                setTimeout(() => {
                    favoriteContainerDiv.classList.remove("active", "closing");
                }, 1500);
            });
        }
    }

    // Tüm kapatma işlemleri için tek listener
    document.addEventListener("click", function (event) {
        // Sepet kontrolü
        if (cartItem && !cartItem.contains(event.target) && !cartBtn.contains(event.target) && cartItem.classList.contains("active")) {
            cartItem.classList.remove("active");
        }
        // Favoriler kontrolü
        if (favoriteContainer && !favoriteContainer.contains(event.target) && !favoriteBtn.contains(event.target) && favoriteContainer.classList.contains("active")) {
            favoriteContainer.classList.remove("active");
        }
    });

    // Sayfa yüklendiğinde tüm ürünler butonuna tıklama olayını ata
    if (tumUrunlerButonu) {
        tumUrunlerButonu.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "urunler.html";
        });
    }

    // Yorum yıldızları ve müşteri yorumu yazısı tıklanabilirlik
    if (stars) {
        const yorumText = stars.nextElementSibling;
        stars.style.cursor = "pointer";
        stars.addEventListener("click", showAllComments);
        if (yorumText) {
            yorumText.style.cursor = "pointer";
            yorumText.addEventListener("click", showAllComments);
        }
    }

    // mobilde hamburger menü açma kapama
    if (hamburger && nav) {
        hamburger.addEventListener("click", function (e) {
            e.stopPropagation();
            if (cartItem && cartItem.classList.contains("active")) {
                cartItem.classList.remove("active");
            }
            if (favoriteContainer && favoriteContainer.classList.contains("active")) {
                favoriteContainer.classList.remove("active");
            }
            nav.classList.add("open");
        });

        nav.addEventListener("click", function (e) {
            e.stopPropagation();
        });

        document.addEventListener("click", function (event) {
            if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
                if (nav.classList.contains("open")) {
                    nav.classList.add("closing");
                    setTimeout(() => {
                        nav.classList.remove("open", "closing");
                    }, 1500);
                }
            }
        });
    }

    // === Scroll-to-Top Butonu ve İlerleme Çemberi ===
    const progressCircle = document.getElementById("scrollProgressCircle");
    const scrollBtnEl = document.getElementById("scrollToTopBtn");
    if (progressCircle) {
      const radius = 28;
      const circumference = 2 * Math.PI * radius;
      progressCircle.style.strokeDasharray = `${circumference}`;
    }
    window.addEventListener("scroll", updateScrollProgress);
    if (scrollBtnEl) {
      scrollBtnEl.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    
    // ÜRÜNLER SAYFASI SCROLL KAYIT
    if (window.location.pathname.includes("urunler.html")) {
        document.querySelectorAll(".product-item a").forEach((link) => {
            link.addEventListener("click", function () {
                sessionStorage.setItem("urunler_scrollY", window.scrollY);
                sessionStorage.setItem("urunler_scrollFlag", "1");
            });
        });

        const scrollFlag = sessionStorage.getItem("urunler_scrollFlag");
        const scrollY = sessionStorage.getItem("urunler_scrollY");
        if (scrollFlag === "1" && scrollY !== null) {
            window.scrollTo(0, parseInt(scrollY));
            sessionStorage.removeItem("urunler_scrollFlag");
        } else {
            sessionStorage.removeItem("urunler_scrollY");
            sessionStorage.removeItem("urunler_scrollFlag");
            window.scrollTo(0, 0);
        }
    }

    // Ürün açıklamaları toggle
    const baslik = document.getElementById("aciklamaBaslik");
    const icerik = document.getElementById("aciklamaIcerik");
    if (baslik && icerik) {
        baslik.addEventListener("click", function () {
            if (icerik.style.display === "none" || icerik.style.display === "") {
                icerik.style.display = "block";
            } else {
                icerik.style.display = "none";
            }
        });
    }

    // Card hover/click efektleri
    document.querySelectorAll(".card").forEach((card) => {
        const cover = card.querySelector(".cover");
        if (!cover) return;

        const imgs = cover.querySelectorAll("img");
        if (imgs.length < 2) return;

        const img1 = imgs[0];
        const img2 = imgs[1];
        let timeoutId;
        let kitapAcik = false;

        img2.style.display = "none";
        img1.style.display = "block";

        card.addEventListener("mouseenter", () => {
            if (kitapAcik) return;
            timeoutId = setTimeout(() => {
                img1.style.display = "none";
                img2.style.display = "block";
                kitapAcik = true;
            }, 1000);
        });

        card.addEventListener("mouseleave", () => {
            if (kitapAcik) {
                setTimeout(() => {
                    img1.style.display = "block";
                    img2.style.display = "none";
                    kitapAcik = false;
                }, 500);
            }
            clearTimeout(timeoutId);
        });

        cover.addEventListener("click", (e) => {
            e.preventDefault();
            if (!kitapAcik) {
                setTimeout(() => {
                    img1.style.display = "none";
                    img2.style.display = "block";
                    kitapAcik = true;
                }, 500);
            } else {
                setTimeout(() => {
                    img1.style.display = "block";
                    img2.style.display = "none";
                    kitapAcik = false;
                }, 500);
            }
        });
    });
});


// --- Fonksiyon Tanımlamaları ---
// Bu fonksiyonlar, DOM içeriği yüklendikten sonra ana blok içinden çağrılacağı için burada tanımlanır.

// Sepet verilerini yükleme
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        cartCount.innerText = cart.length;
    }

    const cartContainer = document.querySelector(".cart-items-container");
    if (!cartContainer) return;
    cartContainer.innerHTML = "";

    let total = 0;

    cart.forEach((item) => {
        let imagePath = item.image;
        if (window.location.hostname.includes("github.io")) {
            if (imagePath.includes("../")) {
                imagePath = imagePath.replace("../", "");
            }
            if (!imagePath.startsWith("/") && !imagePath.startsWith("http")) {
                imagePath = "/ecohome_essentials/" + imagePath;
            }
        } else {
            if (window.location.pathname.includes("urunler-detay-html")) {
                imagePath = "../" + imagePath;
            }
        }
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${imagePath}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <p class="cart-item-price"><span class="cart-item-name">${item.name}</span><br><span class="cart-item-amount">${item.price}</span></p>
            <div style="display:flex; align-items:center;">
              <p>Adet: ${item.quantity}</p>
              <button class="increase-btn">+</button>
              <button class="decrease-btn">-</button>
            </div>
            <button class="remove-btn">Kaldır</button>
        `;

        cartItem.querySelector(".increase-btn").addEventListener("click", function (event) {
            event.stopPropagation();
            increaseQuantity(item.id);
        });

        cartItem.querySelector(".decrease-btn").addEventListener("click", function (event) {
            event.stopPropagation();
            decreaseQuantity(item.id);
        });

        cartItem.querySelector(".remove-btn").addEventListener("click", function (event) {
            event.stopPropagation();
            removeFromCart(item.id);
        });

        cartContainer.appendChild(cartItem);
        total += parseFloat(item.price.replace("₺", "").trim()) * item.quantity;
    });

    const totalPriceElement = document.createElement("div");
    totalPriceElement.classList.add("total-price");
    totalPriceElement.innerHTML = `<p>Toplam Tutar: ₺${total.toFixed(2)}</p>`;
    cartContainer.appendChild(totalPriceElement);
}

// Artırma fonksiyonu
function increaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const product = cart.find((item) => item.id === productId);
    if (product) {
        product.quantity++;
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }
}

// Azaltma fonksiyonu
function decreaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const product = cart.find((item) => item.id === productId);
    if (product && product.quantity > 1) {
        product.quantity--;
        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }
}

// Sepetten ürün çıkarma
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
}

// Favori sayısını güncelleyen fonksiyon
function updateFavoriteCount() {
    const favoriteCount = document.getElementById("favorite-count");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favoriteCount) {
        favoriteCount.innerText = favorites.length;
    }
}

// Favori kutusunu güncelleyen fonksiyon
function updateFavoriteContainer() {
    const favoriteContainer = document.getElementById("favorite-container");
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favoriteContainer) {
        if (favorites.length === 0) {
            favoriteContainer.innerHTML = '<p style="text-align:center;color:#2e7d32;font-size:20px;font-weight:bold;margin-top:20px;">Henüz favori ürün yok.</p>';
        } else {
            let total = 0;
            favoriteContainer.innerHTML = favorites
                .map((item, idx) => {
                    let imagePath = item.image;
                    if (window.location.hostname.includes("github.io")) {
                        if (imagePath.includes("../")) {
                            imagePath = imagePath.replace("../", "");
                        }
                        if (!imagePath.startsWith("/") && !imagePath.startsWith("http")) {
                            imagePath = "/ecohome_essentials/" + imagePath;
                        }
                    } else {
                        if (window.location.pathname.includes("urunler-detay-html")) {
                            if (!imagePath.includes("../")) {
                                imagePath = "../" + imagePath;
                            }
                        } else {
                            if (imagePath.includes("../")) {
                                imagePath = imagePath.replace("../", "");
                            }
                            if (!imagePath.startsWith("/") && !imagePath.startsWith("http")) {
                                imagePath = "/" + imagePath;
                            }
                        }
                    }

                    const price = parseFloat(item.price.replace("₺", "").trim());
                    total += price;

                    return `<div class="cart-item">
                        <img src="${imagePath}" alt="${item.name}" 
                            style="width:60px; height:60px; object-fit:cover; border-radius:8px; margin-right:10px;"
                            onerror="this.onerror=null; this.src='/ecohome_essentials/images/placeholder.jpg';">
                        <p class="cart-item-price"><span class="cart-item-name">${item.name}</span><br><span class="cart-item-amount">${item.price}</span></p>
                        <button class="favorite-remove-btn remove-btn" data-index="${idx}">Kaldır</button>
                    </div>`;
                })
                .join("");

            const totalPriceElement = document.createElement("div");
            totalPriceElement.classList.add("total-price");
            totalPriceElement.innerHTML = `<p>Toplam Tutar: ₺${total.toFixed(2)}</p>`;
            favoriteContainer.appendChild(totalPriceElement);

            const removeBtns = favoriteContainer.querySelectorAll(".favorite-remove-btn");
            removeBtns.forEach((btn) => {
                btn.addEventListener("click", function (e) {
                    e.stopPropagation();
                    const index = parseInt(btn.getAttribute("data-index"));
                    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
                    favorites.splice(index, 1);
                    localStorage.setItem("favorites", JSON.stringify(favorites));
                    updateFavoriteContainer();
                    updateFavoriteCount();
                });
            });
        }
    }
}

// Favorileri yükleyen fonksiyon
function loadFavorites() {
    updateFavoriteContainer();
    updateFavoriteCount();
}

// Yorumların hepsini gösterme fonksiyonu
function showAllComments() {
    var allComments = document.querySelectorAll(".testimonials .testimonial");
    allComments.forEach(function (comment) {
        comment.style.display = "block";
        comment.classList.remove("hidden");
    });
    if (allComments.length >= 3) {
        allComments[2].scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// Scroll-to-Top Butonu ve İlerleme Çemberi
function setProgress(percent) {
    const progressCircle = document.getElementById("scrollProgressCircle");
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    if (progressCircle) {
        const offset = circumference * (1 - percent);
        progressCircle.style.strokeDashoffset = offset;
    }
}

function updateScrollProgress() {
    const scrollBtn = document.getElementById("scrollToTopBtn");
    const progressBg = scrollBtn ? scrollBtn.querySelector(".scroll-progress-bg") : null;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const percent = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBg) progressBg.style.setProperty("--scroll", percent * 100 + "%");
    setProgress(percent);
    if (scrollBtn) {
        if (scrollTop > 200) {
            scrollBtn.style.display = "block";
            scrollBtn.style.opacity = "1";
        } else {
            scrollBtn.style.opacity = "0";
            setTimeout(() => {
                scrollBtn.style.display = "none";
            }, 300);
        }
    }
}