document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("project-gallery");
  const filters = document.querySelectorAll(".filter");
  const projectDetails = document.getElementById("project-details");

  fetch("projects.json")
    .then((response) => response.json())
    .then((projects) => {
      // Display all projects initially
      displayProjects(projects);

      // Add filter functionality
      filters.forEach((filter) => {
        filter.addEventListener("click", (e) => {
          const category = e.target.dataset.category;

          // Update active class for filters
          filters.forEach((f) => f.classList.remove("active"));
          e.target.classList.add("active");

          // Clear project details box
          projectDetails.innerHTML = "";
          projectDetails.classList.remove("active");

          // Filter projects
          if (category === "All") {
            displayProjects(projects);
          } else {
            displayProjects(projects.filter((p) => p.category === category));
          }
        });
      });

      function displayProjects(projects) {
        gallery.innerHTML = ""; // Clear existing projects
        projects.forEach((project) => {
          const card = document.createElement("figure");
          card.className = "project-card";
          card.innerHTML = `
            <img src="${project.coverImage}" alt="${project.title}">
            <figcaption>
              <strong>${project.title}</strong><br>
              ${project.category}
            </figcaption>
          `;
          card.addEventListener("click", () => {
            displayProjectDetails(project);
          });
          gallery.appendChild(card);
        });
      }

      function displayProjectDetails(project) {
        projectDetails.innerHTML = `
          <h1>${project.title}</h1>
          <p><strong>Category:</strong> ${project.category}</p>
          <p>${project.description || "No description available."}</p>
          ${project.media
            .map((media) => {
              if (media.type === "video") {
                return `<iframe src="${media.src}" frameborder="0" allowfullscreen></iframe>`;
              } else if (media.type === "pdf") {
                return `<embed src="${media.src}" type="application/pdf">`;
              } else if (media.type === "link") {
                return `<a href="${media.src}" target="_blank">${media.src}</a>`;
              } else {
                return `<img src="${media.src}" alt="" class="zoomable">`;
              }
            })
            .join("")}
        `;
        projectDetails.classList.add("active");

        // Add zoom functionality to images
        const zoomableImages = document.querySelectorAll(".zoomable");
        zoomableImages.forEach((img) => {
          img.addEventListener("click", () => {
            showZoomPopup(img.src);
          });
        });
      }

      function showZoomPopup(src) {
        const popup = document.createElement("div");
        popup.className = "zoom-popup";
        popup.innerHTML = `
          <img src="${src}" alt="Zoomed Image">
          <span class="close">&times;</span>
        `;
        document.body.appendChild(popup);
        popup.style.display = "block";

        // Close functionality
        popup.querySelector(".close").addEventListener("click", () => {
          popup.style.display = "none";
          document.body.removeChild(popup);
        });
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
