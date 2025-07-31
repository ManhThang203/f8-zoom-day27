// lấy ra các Dom
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const codeInput = $("#code-input");
const previewFrame = $("#preview-frame");
const contextMenu = $("#context-menu");
const deleteBtn = contextMenu.querySelector(".delete");
const copyBtn = contextMenu.querySelector(".copy");
const pasteBtn = contextMenu.querySelector(".paste");
// lưu trữ nội dung đã copy
let clipboardValue = "";
window.addEventListener("beforeunload", handleBeforeUnload);
codeInput.addEventListener("input", updatePreview);
document.addEventListener("contextmenu", showContextMenu);
document.addEventListener("mousedown", hideContextMenuIfClickedOutside);
contextMenu.addEventListener("click", handleContextMenuClick);

function handleBeforeUnload(e) {
  // nếu không có giá trị thì kết thúc luôn
  if (!codeInput.value.trim()) return;
  e.returnValue = "Are you sure you want to leave?";
}
// Gán nội dung HTML trong textarea vào iframe để xem trước ngay
function updatePreview() {
  previewFrame.srcdoc = codeInput.value.trim();
}

function showContextMenu(e) {
  if (e.target.closest(".preview")) return;

  e.preventDefault();
  contextMenu.hidden = false;

  const { clientX: x, clientY: y } = e;
  Object.assign(contextMenu.style, calculateMenuPosition(x, y));
  // kiểm tra người dùng bó bôi đen hay không
  // nếu codeInput.selectionStart !== codeInput.selectionEnd có nghĩa là người dùng đang bôi đe
  // trả về true
  const hasSelection = codeInput.selectionStart !== codeInput.selectionEnd;
  // nếu không copy và đang foces trên trính phần tử đó thì bỏ
  // document.activeElement để kiểm tra xem phần tủ có được focus hay không
  // codeInput.blur bỏ focus
  if (!hasSelection && document.activeElement === codeInput) {
    codeInput.blur();
  }
}

function hideContextMenuIfClickedOutside(e) {
  // nếu phần từ chứa trong contextMenu thì ấn đi
  if (!contextMenu.contains(e.target)) {
    contextMenu.hidden = true;
  }
}

function handleContextMenuClick(e) {
  const clicked = e.target.closest("li");

  if (clicked === deleteBtn) {
    handleDelete();
  }

  if (clicked === copyBtn) {
    handleCopy();
  }

  if (clicked === pasteBtn) {
    handlePaste();
  }

  contextMenu.hidden = true;
}

function handleDelete() {
  codeInput.value = "";
  previewFrame.srcdoc = "";
}

function handleCopy() {
  const selected = codeInput.value.substring(
    codeInput.selectionStart,
    codeInput.selectionEnd
  );
  clipboardValue = selected || codeInput.value;
}

function handlePaste() {
  codeInput.value += clipboardValue;
  previewFrame.srcdoc = codeInput.value;
}

function calculateMenuPosition(mouseX, mouseY) {
  const menuWidth = contextMenu.offsetWidth;
  const menuHeight = contextMenu.offsetHeight;

  const isOverflowBottom = mouseY + menuHeight > window.innerHeight;
  const isOverflowRight = mouseX + menuWidth > window.innerWidth;

  return {
    top: isOverflowBottom ? `${mouseY - menuHeight}px` : `${mouseY}px`,
    left: isOverflowRight ? `${mouseX - menuWidth}px` : `${mouseX}px`,
  };
}
