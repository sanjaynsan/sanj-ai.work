document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("project-gallery");
  const projectDetails = document.getElementById("project-details");

  // Load projects.json
  fetch("projects.json")
    .then((response) => response.json())
    .then((projects) => {
      if (gallery) {
        // Populate project gallery
        projects.forEach((project) => {
          const card = document.createElement("div");
          card.className = "project-card";
          card.innerHTML = `
            <img src="${project.coverImage}" alt="${project.title}">
            <div class="overlay">
              <h3>${project.title}</h3>
              <p>${project.category}</p>
            </div>
          `;
          card.addEventListener("click", () => {
            window.location.href = `project.html?id=${project.id}`;
          });
          gallery.appendChild(card);
        });
      }

      if (projectDetails) {
        // Load project details
        const params = new URLSearchParams(window.location.search);
        const projectId = params.get("id");
        const project = projects.find((p) => p.id === projectId);

        if (project) {
          projectDetails.innerHTML = `
            <h1>${project.title}</h1>
            <p><strong>Category:</strong> ${project.category}</p>
            <p>${project.description}</p>
            <img src="${project.coverImage}" alt="${project.title}">
            ${project.media
              .map((media) => {
                if (media.type === "video") {
                  return `<iframe src="${media.src}" frameborder="0" allowfullscreen></iframe>`;
                } else if (media.type === "pdf") {
                  return `<embed src="${media.src}" type="application/pdf">`;
                } else if (media.type === "link") {
                  return `<a href="${media.src}" target="_blank">${media.src}</a>`;
                } else {
                  return `<img src="${media.src}" alt="">`;
                }
              })
              .join("")}
          `;
        } else {
          projectDetails.innerHTML = "<p>Project not found.</p>";
        }
      }
    });
});

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
