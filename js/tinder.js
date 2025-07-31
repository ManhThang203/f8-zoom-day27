// Danh sách người chơi (giống như thẻ người dùng Tinder)
let players = [
  { name: "Thy", age: 22, bio: "Yêu mèo, thích cà phê và sách.", image: "./assets/img/thy.jpg" },
  { name: "Phương", age: 22, bio: "Thích lấu ăn, đi du lịch", image: "./assets/img/phương.jpg" },
  { name: "Linh", age: 22, bio: "Thích chơi game", image: "./assets/img/Linh.jpg" },
  { name: "Ngọc", age: 22, bio: "Thích thể thao", image: "./assets/img/ngoc.jpg" },
  { name: "Thảo", age: 22, bio: "Thích xem phim", image: "./assets/img/thao.jpg" },
  { name: "Trà", age: 22, bio: "Thích chạy bộ", image: "./assets/img/tra.jpg" },
];

// Hai mảng chứa người dùng đã thích hoặc không thích
const disliked = [];
const liked = [];

// DOM element cho khung chứa thẻ và hai nút like/dislike
const cardStack = document.getElementById("card-stack");
const likeBtn = document.getElementById("like-btn");
const dislikeBtn = document.getElementById("dislike-btn");

// Biến trạng thái để kéo
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// Ngưỡng vuốt để xác định có chấp nhận thao tác hay không
const swipeThreshold = 60;
const rotationFactor = 0.05; // mức xoay khi kéo
const stackSize = 3; // số lượng thẻ hiển thị cùng lúc

// Tạo thẻ HTML từ dữ liệu người chơi
function createCardElement(player, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${player.image}" alt="${player.name}">
    <div class="card-info">
      <h2>${player.name}, <span>${player.age}</span></h2>
      <p>${player.bio}</p>
    </div>
  `;
  return card;
}

// Hiển thị các thẻ trong stack
function renderCardStack() {
  // Nếu còn đủ thẻ trong stack thì chỉ thêm thẻ tiếp theo
  if (cardStack.children.length > 0 && players.length > 0 && cardStack.children.length >= stackSize) {
    const nextPlayerIndex = stackSize - 1;
    if (players[nextPlayerIndex] && cardStack.children.length < players.length + (stackSize - 1)) {
      const nextCard = createCardElement(players[nextPlayerIndex], nextPlayerIndex);
      cardStack.appendChild(nextCard);
    }
    attachTopCardListeners();
    return;
  }

  // Trường hợp ban đầu hoặc hết người
  cardStack.innerHTML = "";
  if (players.length === 0) {
    displayNoMoreUsersMessage();
    disableButtons();
    return;
  }

  // Hiển thị tối đa `stackSize` thẻ
  const cardsToRender = players.slice(0, stackSize);
  cardsToRender.forEach((player, index) => {
    const cardElement = createCardElement(player, index);
    cardStack.appendChild(cardElement);
  });

  attachTopCardListeners();
  enableButtons();
}

// Gắn sự kiện cho thẻ đầu tiên (để kéo)
function attachTopCardListeners() {
  const topCard = cardStack.querySelector(".card:first-child");
  if (topCard) {
    topCard.removeEventListener("mousedown", handleStart);
    topCard.removeEventListener("touchstart", handleStart);
    topCard.addEventListener("mousedown", handleStart);
    topCard.addEventListener("touchstart", handleStart);
  }
}

// Gỡ sự kiện kéo (sau khi thả chuột hoặc kết thúc vuốt)
function removeDragListeners() {
  window.removeEventListener("mousemove", handleMove);
  window.removeEventListener("mouseup", handleEnd);
  window.removeEventListener("touchmove", handleMove);
  window.removeEventListener("touchend", handleEnd);
  window.removeEventListener("touchcancel", handleEnd);
}

// Bắt đầu kéo
function handleStart(e) {
  if (e.type === "mousedown" && e.button !== 0) return; // chỉ chuột trái

  const topCard = cardStack.querySelector(".card:first-child");
  if (!topCard) return;

  isDragging = true;
  e.preventDefault();

  // Lấy vị trí bắt đầu của chuột hoặc tay
  if (e.type === "touchstart") {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  } else {
    startX = e.clientX;
    startY = e.clientY;
  }



  currentX = 0;
  currentY = 0;

  topCard.classList.add("dragging");

  // Lắng nghe thao tác kéo
  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleEnd);
  window.addEventListener("touchmove", handleMove, { passive: false });
  window.addEventListener("touchend", handleEnd);
  window.addEventListener("touchcancel", handleEnd);
}

// Xử lý trong khi đang kéo
function handleMove(e) {
  if (!isDragging) return;

  const topCard = cardStack.querySelector(".card:first-child");
  if (!topCard) return;

  e.preventDefault();

  let clientX, clientY;
  if (e.type === "touchmove") {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  const deltaX = clientX - startX;
  const deltaY = clientY - startY;

  currentX = deltaX;
  currentY = deltaY;

  const rotate = deltaX * rotationFactor;


  // Di chuyển và xoay thẻ theo tay
  topCard.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`;

  // Thêm class để đổi màu khi kéo
  if (deltaX > 0) {
    topCard.classList.add("swiping-right");
    topCard.classList.remove("swiping-left");
  } else if (deltaX < 0) {
    topCard.classList.add("swiping-left");
    topCard.classList.remove("swiping-right");
  } else {
    topCard.classList.remove("swiping-left", "swiping-right");
  }
}

// Kết thúc thao tác kéo
function handleEnd(e) {
  if (!isDragging) return;

  const topCard = cardStack.querySelector(".card:first-child");
  if (!topCard) {
    isDragging = false;
    removeDragListeners();
    return;
  }

  isDragging = false;
  removeDragListeners();

  topCard.classList.remove("dragging");

  // Nếu kéo đủ xa thì swipe
  if (Math.abs(currentX) >= swipeThreshold) {
    const direction = currentX > 0 ? "right" : "left";
    swipeCard(topCard, direction);
  } else {
    resetCard(topCard);
  }

  currentX = 0;
  currentY = 0;
}

// Trả thẻ về vị trí ban đầu nếu kéo chưa đủ
function resetCard(card) {
  card.style.transform = "";
  card.style.backgroundColor = `#fff`;
  card.classList.remove(
    "swiping-left",
    "swiping-right",
    "swipe-exit-left",
    "swipe-exit-right"
  );
}

// Vuốt thẻ sang trái/phải
function swipeCard(card, direction) {
  disableButtons(); // tạm thời disable để tránh spam

  // Thêm animation ra khỏi màn
  if (direction === "left") {
    card.classList.add("swipe-exit-left");
  } else {
    card.classList.add("swipe-exit-right");
  }

  // Chờ animation kết thúc
  card.addEventListener("transitionend", function handler() {
    card.removeEventListener("transitionend", handler);
    card.remove();

    // Cập nhật dữ liệu
    const swipedPlayer = players.shift();
    if (swipedPlayer) {
      if (direction === "left") {
        disliked.push(swipedPlayer);
        console.log("Disliked:", swipedPlayer.name, disliked);
      } else {
        liked.push(swipedPlayer);
        console.log("Liked:", swipedPlayer.name, liked);
      }
    }

    renderCardStack();
    enableButtons();
  });

  // Xoá class kéo
  card.classList.remove("swiping-left", "swiping-right");
}

// Xử lý khi click nút like/dislike
function handleButtonClick(direction) {
  const topCard = cardStack.querySelector(".card:first-child");
  if (topCard && !isDragging) {
    swipeCard(topCard, direction);
  }
}

// Hiển thị thông báo khi hết người
function displayNoMoreUsersMessage() {
  const message = document.createElement("div");
  message.classList.add("no-more-users");
  message.textContent = "YoungTobi 🐱‍🏍";
  cardStack.appendChild(message);
}

// Disable nút khi xử lý
function disableButtons() {
  likeBtn.disabled = true;
  dislikeBtn.disabled = true;
}

// Enable lại nút
function enableButtons() {
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
}

// Gán sự kiện click cho 2 nút
likeBtn.addEventListener("click", () => handleButtonClick("right"));
dislikeBtn.addEventListener("click", () => handleButtonClick("left"));

// Gọi hàm render lần đầu
renderCardStack();
