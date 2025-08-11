// Sepeti ve favorileri yükle
window.onload = function () {
  loadCart();
  loadFavorites(); // Favorileri de yükle
};

// Sepeti LocalStorage'dan al veya boş bir dizi oluştur
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Favori öğelerini saklamak için dizi
let favoriteItems = JSON.parse(localStorage.getItem("favorites")) || [];

// 'Sepete Ekle' butonlarına tıklama
const addToCartButtons = document.querySelectorAll(".btn");

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
      event.preventDefault(); // Sadece ilgili butonlarda sayfanın yenilenmesini engelle

      let productName, productPrice, productImage;

      // Menü kısmındaki ürünler için veri çekme
      if (button.closest(".menu")) {
        const productBox = button.closest(".box");
        productName = productBox.querySelector("h3").textContent;
        productPrice = productBox
          .querySelector(".price")
          .textContent.trim()
          .split(" ")[0]; // Fiyatı sadece sayısal kısım
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
        // .details veya .card içinden bilgileri al
        const details = button.closest(".details") || button.closest(".card");
        if (details) {
          // Ürün adı
          const h3 = details.querySelector("h3");
          if (h3) productName = h3.textContent.trim();
          // Fiyat
          const h2 = details.querySelector("h2");
          if (h2) productPrice = h2.textContent.trim();
          // Resim
          const img = details.querySelector("img");
          if (img) productImage = img.src;
        }
        // Eğer data-* attribute'ları varsa öncelik ver
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

      // Benzersiz ID oluşturma (sadece ürün adına göre)
      const productId = productName.toLowerCase().trim();

      // Aynı üründen var mı kontrol et
      const existingProduct = cart.find((item) => item.id === productId);

      if (existingProduct) {
        // Eğer ürün varsa, miktarını arttır
        existingProduct.quantity++;
      } else {
        // Yeni ürün ekle
        const product = {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
          quantity: 1, // Başlangıçta 1
        };
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      loadCart();
    }
    // ...aksi halde (ör: geri dön butonu) hiçbir şey yapma, link normal çalışsın
  });
});

// Sepet verilerini yükleme
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("Sepet:", cart);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.innerText = cart.length; // Sepet sayısını doğru şekilde güncelle
  }

  const cartContainer = document.querySelector(".cart-items-container");
  if (!cartContainer) return;
  cartContainer.innerHTML = ""; // Önce sepeti temizle

  let total = 0; // Toplam tutar için değişken

  cart.forEach((item) => {
    let imagePath = item.image;

    // Resim yolunu düzelt - GitHub Pages için
    if (window.location.hostname.includes("github.io")) {
      // GitHub Pages canlı ortam
      if (imagePath.includes("../")) {
        imagePath = imagePath.replace("../", "");
      }
      if (!imagePath.startsWith("/") && !imagePath.startsWith("http")) {
        imagePath = "/ecohome_essentials/" + imagePath;
      }
    } else {
      // Local geliştirme ortamı
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

    // Artırma butonuna tıklama
    cartItem
      .querySelector(".increase-btn")
      .addEventListener("click", function (event) {
        event.stopPropagation(); // Sepetin kapanmasını engelle
        increaseQuantity(item.id);
      });

    // Azaltma butonuna tıklama
    cartItem
      .querySelector(".decrease-btn")
      .addEventListener("click", function (event) {
        event.stopPropagation(); // Sepetin kapanmasını engelle
        decreaseQuantity(item.id);
      });

    // Ürünü sepetten kaldırma
    cartItem
      .querySelector(".remove-btn")
      .addEventListener("click", function (event) {
        event.stopPropagation(); // Sepetin kapanmasını engelle
        removeFromCart(item.id);
      });

    cartContainer.appendChild(cartItem);

    // Toplam tutarı hesapla
    total += parseFloat(item.price.replace("₺", "").trim()) * item.quantity;
  });

  // Sepet alt kısmına toplam tutarı yazdır
  const totalPriceElement = document.createElement("div");
  totalPriceElement.classList.add("total-price");
  totalPriceElement.innerHTML = `
    <p>Toplam Tutar: ₺${total.toFixed(2)}</p>
  `;
  cartContainer.appendChild(totalPriceElement);
}

// Artırma fonksiyonu
function increaseQuantity(productId) {
  const product = cart.find((item) => item.id === productId);
  if (product) {
    product.quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
}

// Azaltma fonksiyonu
function decreaseQuantity(productId) {
  const product = cart.find((item) => item.id === productId);
  if (product && product.quantity > 1) {
    product.quantity--;
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }
}

// Sepetten ürün çıkarma
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Sepet butonuna tıklama işlemi
const cartBtn = document.querySelector("#cart-btn");
const cartItem = document.querySelector(".cart-items-container");

// Sepeti açma ve kapama işlemi
if (cartBtn && cartItem) {
  cartBtn.addEventListener("click", function (event) {
    event.stopPropagation(); // Butona tıklandığında sepetin kapanmamasını sağlar
    cartItem.classList.toggle("active"); // Sepeti aç / kapa
  });

  // Sepet kapanma butonuna tıklanınca yumuşak kapanma
  const closeCartBtn = document.querySelector(".close-cart-btn");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", function () {
      // Önce kapanma animasyonu sınıfını ekle
      cartItem.classList.add("closing");

      // Animasyon tamamlandıktan sonra active sınıfını kaldır
      setTimeout(() => {
        cartItem.classList.remove("active", "closing");
      }, 1000); // CSS'deki transition süresi ile eşleşmeli
    });
  }


}

if (!window.favoriteItems) {
  window.favoriteItems = JSON.parse(localStorage.getItem("favorites")) || [];
}
favoriteItems = window.favoriteItems;

// Call the updateFavoriteCount function to update the favorite count
updateFavoriteCount();

// Favori butonları ve favori bölümünü güncelle
const favoriteButtons = document.querySelectorAll(".favorite-btn");
const favoriteContainer = document.getElementById("favorite-container");
const favoriteCount = document.getElementById("favorite-count");

// Favori öğelerini localStorage'dan al
favoriteItems = JSON.parse(localStorage.getItem("favorites")) || [];
updateFavoriteContainer();
updateFavoriteCount();

// Sayfa yüklendiğinde tüm ürünler butonuna tıklama olayını ata
// Önce butonu seç
const tumUrunlerButonu = document.getElementById("btn-tum-urunler");

if (tumUrunlerButonu) {
  tumUrunlerButonu.addEventListener("click", function (e) {
    e.preventDefault(); // Sayfayı hemen yönlendirmesin diye
    window.location.href = "urunler.html";
  });
}

// Favorilere ekleme işlemi
favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productName = button.getAttribute("data-name");
    const productPrice = button.getAttribute("data-price");
    const productImage = button.getAttribute("data-image");

    if (productName && productPrice && productImage) {
      // Ürün favorilere eklenmemişse ekle
      const exists = favoriteItems.some((item) => item.name === productName);
      if (!exists) {
        favoriteItems.push({
          name: productName,
          price: productPrice,
          image: productImage,
        });

        // Favorileri localStorage'a kaydet
        localStorage.setItem("favorites", JSON.stringify(favoriteItems));

        // Favori kutusunu güncelle ve favori sayısını güncelle
        updateFavoriteContainer();
        updateFavoriteCount();

        // Kalp ikonunu güncelle
        const heartIcon = document.querySelector(".heart-icon"); // Kalp ikonunun seçimi
        if (heartIcon) {
          heartIcon.classList.add("active"); // Kalp ikonunu aktif hale getir
        }
      } else {
        alert("Bu ürün zaten favorilerinizde!");
      }
    }
  });
});

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
  favoriteItems = favorites;
  console.log("Mevcut favoriler:", favorites);
  console.log("Sayfa yolu:", window.location.pathname);

  if (favoriteContainer) {
    if (favorites.length === 0) {
      favoriteContainer.innerHTML =
        '<p style="text-align:center;color:#2e7d32;font-size:20px;font-weight:bold;margin-top:20px;">Henüz favori ürün yok.</p>';
    } else {
      let total = 0; // Toplam tutar için değişken

      favoriteContainer.innerHTML = favorites
        .map((item, idx) => {
          let imagePath = item.image;
          console.log("Orijinal resim yolu:", imagePath);

          // Resim yolunu düzelt - GitHub Pages için
          if (window.location.hostname.includes("github.io")) {
            // GitHub Pages canlı ortam
            if (imagePath.includes("../")) {
              imagePath = imagePath.replace("../", "");
            }
            if (!imagePath.startsWith("/") && !imagePath.startsWith("http")) {
              imagePath = "/ecohome_essentials/" + imagePath;
            }
          } else {
            // Local geliştirme ortamı
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

          console.log("Düzeltilmiş resim yolu:", imagePath);

          // Fiyatı sayısal değere çevir ve toplama ekle
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

      // Toplam tutarı ekle
      const totalPriceElement = document.createElement("div");
      totalPriceElement.classList.add("total-price");
      totalPriceElement.innerHTML = `
        <p>Toplam Tutar: ₺${total.toFixed(2)}</p>
      `;
      favoriteContainer.appendChild(totalPriceElement);

      // Kaldır butonlarına event ekle
      const removeBtns = favoriteContainer.querySelectorAll(
        ".favorite-remove-btn"
      );
      removeBtns.forEach((btn) => {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          const index = parseInt(btn.getAttribute("data-index"));
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

// Menüdeki kalp (favori) ikonuna tıklanınca favori kutusunu aç/kapat
const favoriteBtn = document.getElementById("favorite-btn");
const favoriteContainerDiv = document.getElementById("favorite-container");

if (favoriteBtn && favoriteContainerDiv) {
  favoriteBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    // Sepet açıksa kapat
    if (cartItem && cartItem.classList.contains("active")) {
      cartItem.classList.remove("active");
    }
    favoriteContainerDiv.classList.toggle("active");
  });

  // Favoriler kapanma butonuna tıklanınca yumuşak kapanma
  const closeFavBtn = document.querySelector(".close-fav-btn");
  if (closeFavBtn) {
    closeFavBtn.addEventListener("click", function () {
      // Önce kapanma animasyonu sınıfını ekle
      favoriteContainerDiv.classList.add("closing");

      // Animasyon tamamlandıktan sonra active sınıfını kaldır
      setTimeout(() => {
        favoriteContainerDiv.classList.remove("active", "closing");
      }, 1500); // CSS'deki transition süresi ile eşleşmeli
    });
  }



  const cartBtn = document.getElementById("cart-btn");
  const favoriteContainerDiv = document.getElementById("favorite-container");

  if (cartBtn && favoriteContainerDiv) {
    cartBtn.addEventListener("click", function () {
      if (favoriteContainerDiv.classList.contains("active")) {
        // Yumuşak kapanma için
        favoriteContainerDiv.classList.add("closing");
        setTimeout(() => {
          favoriteContainerDiv.classList.remove("active", "closing");
        }, 1500);
      }
    });
  }

  // Favoriler açıldığında sepeti kapat
  if (favoriteBtn && cartItem) {
    favoriteBtn.addEventListener("click", function () {
      if (cartItem.classList.contains("active")) {
        // Sepeti yumuşak kapanma ile kapat
        cartItem.classList.add("closing");
        setTimeout(() => {
          cartItem.classList.remove("active", "closing");
        }, 1500);
      }
    });
  }
}

// Tüm kapatma işlemleri için tek listener
document.addEventListener("click", function (event) {
  // Sepet kontrolü
  if (!cartItem.contains(event.target) && !cartBtn.contains(event.target)) {
    if (cartItem.classList.contains("active")) {
      cartItem.classList.add("closing");
      setTimeout(() => {
        cartItem.classList.remove("active", "closing");
      }, 1500);
    }
  }
  
  // Favoriler kontrolü
  if (!favoriteContainerDiv.contains(event.target) && !favoriteBtn.contains(event.target)) {
    if (favoriteContainerDiv.classList.contains("active")) {
      favoriteContainerDiv.classList.add("closing");
      setTimeout(() => {
        favoriteContainerDiv.classList.remove("active", "closing");
      }, 1500);
    }
  }
  
  // Menu kontrolü
  if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
    if (nav.classList.contains("open")) {
      nav.classList.add("closing");
      setTimeout(() => {
        nav.classList.remove("open", "closing");
      }, 1500);
    }
  }
});

//ürünlerin yorum kodları
const stars = document.querySelector(".bambu-detay-stars");
const yorumText = document.querySelector(".bambu-detay-stars + span");

function showAllComments() {
  document.querySelectorAll(".testimonials .testimonial").forEach((comment) => {
    comment.style.display = "block";
    comment.classList.remove("hidden");
  });
  // 3. yoruma kaydır
  const allComments = document.querySelectorAll(".testimonials .testimonial");
  if (allComments.length >= 3) {
    allComments[2].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

if (stars) stars.addEventListener("click", showAllComments);
if (yorumText) yorumText.addEventListener("click", showAllComments);

// Yorum yıldızları ve müşteri yorumu yazısı tıklanabilirlik (tüm ürün detay sayfaları için)
document.addEventListener("DOMContentLoaded", function () {
  var stars = document.querySelector(".bambu-detay-stars");
  var yorumText = null;
  if (stars) {
    // Yıldızların hemen yanındaki span'ı bul
    yorumText = stars.querySelector("span");
    // Eğer span yoksa, bir sonraki kardeş olarak ara (eski kod uyumluluğu için)
    if (!yorumText) {
      var next = stars.nextElementSibling;
      if (next && next.tagName === "SPAN") yorumText = next;
    }
    // Tıklanabilirlik ekle
    stars.style.cursor = "pointer";
    stars.addEventListener("click", showAllComments);
    if (yorumText) {
      yorumText.style.cursor = "pointer";
      yorumText.addEventListener("click", showAllComments);
    }
  }
});

function showAllComments() {
  var allComments = document.querySelectorAll(".testimonials .testimonial");
  allComments.forEach(function (comment) {
    comment.style.display = "block";
    comment.classList.remove("hidden");
  });
  // 3. yoruma kaydır
  if (allComments.length >= 3) {
    allComments[2].scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
//mobilde hamburger menü açma kapama
document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger");
  const nav = document.querySelector(".nav");
  const cartItem = document.querySelector(".cart-items-container");
  const favoriteContainerDiv = document.getElementById("favorite-container");

  if (hamburger && nav) {
    // Hamburger tıklanırsa menü aç/kapa
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation(); // Olayın yayılmasını engelle // Sepet veya favoriler açıksa onları kapat

      if (cartItem && cartItem.classList.contains("active")) {
        cartItem.classList.remove("active");
      }
      if (
        favoriteContainerDiv &&
        favoriteContainerDiv.classList.contains("active")
      ) {
        favoriteContainerDiv.classList.remove("active");
      } // Menüyü açar. Eğer açıksa tekrar açmaya çalışmaz, yani her zaman açık kalır.

      nav.classList.add("open");
    }); // Menü içeriğine tıklanırsa kapanmasın

    nav.addEventListener("click", function (e) {
      e.stopPropagation();
    });     // Sayfadaki herhangi bir yere tıklanınca menü kapansın

    document.addEventListener("click", function () {
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
});

// === Scroll-to-Top Butonu ve İlerleme Çemberi ===
document.addEventListener("DOMContentLoaded", function () {
  const scrollBtn = document.getElementById("scrollToTopBtn");
  const progressBg = scrollBtn
    ? scrollBtn.querySelector(".scroll-progress-bg")
    : null;
  const progressCircle = document.getElementById("scrollProgressCircle");
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  if (progressCircle) progressCircle.style.strokeDasharray = `${circumference}`;

  function setProgress(percent) {
    if (progressCircle) {
      const offset = circumference * (1 - percent);
      progressCircle.style.strokeDashoffset = offset;
    }
  }

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const percent = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBg)
      progressBg.style.setProperty("--scroll", percent * 100 + "%");
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

  window.addEventListener("scroll", updateScrollProgress);
  updateScrollProgress(); // Sayfa yüklenince de kontrol et

  if (scrollBtn) {
    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

// --- ÜRÜNLER SAYFASI SCROLL KAYIT ---
if (window.location.pathname.includes("urunler.html")) {
  // Ürün detay linkine tıklanınca scroll konumunu ve bayrağı kaydet
  document.querySelectorAll(".product-item a").forEach((link) => {
    link.addEventListener("click", function () {
      sessionStorage.setItem("urunler_scrollY", window.scrollY);
      sessionStorage.setItem("urunler_scrollFlag", "1");
    });
  });

  // Sayfa yüklenince: sadece detaydan geri gelindiyse scroll konumunu uygula
  window.addEventListener("DOMContentLoaded", function () {
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
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const baslik = document.getElementById("aciklamaBaslik");
  const icerik = document.getElementById("aciklamaIcerik");

  baslik.addEventListener("click", function () {
    if (icerik.style.display === "none" || icerik.style.display === "") {
      icerik.style.display = "block";
    } else {
      icerik.style.display = "none";
    }
  });
});

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

  // Desktop hover
  card.addEventListener("mouseenter", () => {
    if (kitapAcik) return;

    // Hover başladı, 1 saniye sonra değiştir
    timeoutId = setTimeout(() => {
      img1.style.display = "none";
      img2.style.display = "block";
      kitapAcik = true;
    }, 1000);
  });

  card.addEventListener("mouseleave", () => {
    if (kitapAcik) {
      // Kapanma animasyon süresi varsayalım 500ms
      setTimeout(() => {
        img1.style.display = "block";
        img2.style.display = "none";
        kitapAcik = false;
      }, 500);
    }
    clearTimeout(timeoutId);
  });

  // Mobil/tablet tıklama için
  cover.addEventListener("click", (e) => {
    e.preventDefault();

    if (!kitapAcik) {
      // Kitap açılma animasyonu süresi 500ms varsayıyoruz
      setTimeout(() => {
        img1.style.display = "none";
        img2.style.display = "block";
        kitapAcik = true;
      }, 500);
    } else {
      // Kitap kapanma animasyonu süresi 500ms
      setTimeout(() => {
        img1.style.display = "block";
        img2.style.display = "none";
        kitapAcik = false;
      }, 500);
    }
  });
});
