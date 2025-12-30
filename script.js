const dragBox = document.getElementById("dragBox");

let isDragging = false;
let offsetX, offsetY;

dragBox.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - dragBox.offsetLeft;
    offsetY = e.clientY - dragBox.offsetTop;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        dragBox.style.left = e.clientX - offsetX + "px";
        dragBox.style.top = e.clientY - offsetY + "px";
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});
