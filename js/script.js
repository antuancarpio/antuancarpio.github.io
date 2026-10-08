// ============================================================
// Cambio de modo oscuro / claro
// ============================================================
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const theme = saved || (systemPrefersLight ? "light" : "dark");
  document.documentElement.setAttribute("data-theme", theme);
})();

const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateSimpleIconColors();
});

// ============================================================
// Tecnologías (logos SVG vía Devicon CDN / Simple Icons CDN)
// ============================================================
const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/";
const SIMPLEICONS = "https://cdn.simpleicons.org/";

const technologies = [
  { name: "HTML", file: "html5/html5-plain.svg" },
  { name: "CSS", file: "css3/css3-plain.svg" },
  { name: "JavaScript", file: "javascript/javascript-plain.svg" },
  { name: "Java", file: "java/java-plain.svg" },
  { name: "Python", file: "python/python-plain.svg" },
  { name: "WordPress", file: "wordpress/wordpress-plain.svg" },
  { name: "PHP", file: "php/php-plain.svg" },
  { name: "C#", file: "csharp/csharp-plain.svg" },
  { name: "Perl", file: "perl/perl-plain.svg" }
];

const servers = [
  { name: "Ubuntu Server", file: "ubuntu/ubuntu-plain.svg" },
  { name: "Windows Server", file: "windows8/windows8-original.svg" },
  { name: "Cisco Packet Tracer", simpleIcon: "cisco" },
  { name: "Oracle VirtualBox", simpleIcon: "virtualbox" }
];

const ides = [
  { name: "NetBeans", file: "netbeans/netbeans-original.svg" },
  { name: "IntelliJ IDEA", file: "intellij/intellij-plain.svg" },
  { name: "Visual Studio", file: "visualstudio/visualstudio-plain.svg" },
  { name: "GitHub", file: "github/github-original.svg" }
];

function accentHex() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "123a6b" : "4fc3f7";
}

function renderTechGrid(grid, items) {
  if (!grid) return;
  grid.innerHTML = items
    .map((item) => {
      if (item.simpleIcon) {
        return `
      <div class="tech-card glass reveal">
        <img class="tech-icon-img" src="${SIMPLEICONS}${item.simpleIcon}/${accentHex()}" alt="Logo de ${item.name}" loading="lazy" data-slug="${item.simpleIcon}" />
        <span class="tech-name">${item.name}</span>
      </div>`;
      }
      return `
      <div class="tech-card glass reveal" style="--icon:url('${DEVICON}${item.file}')">
        <span class="tech-icon" role="img" aria-label="Logo de ${item.name}"></span>
        <span class="tech-name">${item.name}</span>
      </div>`;
    })
    .join("");

  grid.querySelectorAll(".tech-icon-img").forEach((img) => {
    img.addEventListener("error", () => img.closest(".tech-card").classList.add("no-icon"));
    img.addEventListener("load", () => img.closest(".tech-card").classList.remove("no-icon"));
  });
}

function updateSimpleIconColors() {
  const hex = accentHex();
  document.querySelectorAll(".tech-icon-img[data-slug]").forEach((img) => {
    img.src = `${SIMPLEICONS}${img.dataset.slug}/${hex}`;
  });
}

renderTechGrid(document.getElementById("techGrid"), technologies);
renderTechGrid(document.getElementById("serversGrid"), servers);
renderTechGrid(document.getElementById("idesGrid"), ides);

// ============================================================
// Animaciones al hacer scroll
// ============================================================
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${(index % 6) * 60}ms`;
  revealObserver.observe(el);
});

// ============================================================
// Menú móvil y enlace activo según sección visible
// ============================================================
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const sections = document.querySelectorAll("main section[id]");
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

// ============================================================
// Carruseles de imágenes de los proyectos
// ============================================================
function buildGallery(container) {
  const files = (container.dataset.images || "")
    .split("|")
    .map((file) => file.trim())
    .filter(Boolean);

  if (!files.length) {
    container.innerHTML = `
      <div class="gallery-viewport">
        <div class="gallery-placeholder">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 12h14l-4.5-6-3.5 4.5-2.5-3L5 17zm3.5-7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
          <span>Sin imágenes todavía</span>
        </div>
      </div>`;
    return;
  }

  const slides = files
    .map(
      (src) => `
      <div class="gallery-slide">
        <img src="${src}" alt="" loading="lazy" />
      </div>`
    )
    .join("");

  const dots = files
    .map((_, i) => `<button class="gallery-dot${i === 0 ? " active" : ""}" type="button" aria-label="Ir a la imagen ${i + 1}"></button>`)
    .join("");

  container.innerHTML = `
    <div class="gallery-viewport">
      <div class="gallery-track">${slides}</div>
      <button class="gallery-nav gallery-prev" type="button" aria-label="Imagen anterior">&#8249;</button>
      <button class="gallery-nav gallery-next" type="button" aria-label="Imagen siguiente">&#8250;</button>
      <div class="gallery-dots">${dots}</div>
    </div>`;

  container.querySelectorAll(".gallery-slide img").forEach((img) => {
    img.addEventListener("error", () => img.closest(".gallery-slide").classList.add("no-img"));
  });

  const track = container.querySelector(".gallery-track");
  const dotEls = [...container.querySelectorAll(".gallery-dot")];
  const prev = container.querySelector(".gallery-prev");
  const next = container.querySelector(".gallery-next");
  let index = 0;
  let timer = null;

  const go = (i) => {
    index = (i + files.length) % files.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dotEls.forEach((dot, di) => dot.classList.toggle("active", di === index));
  };

  const stopAuto = () => { if (timer) clearInterval(timer); };
  const startAuto = () => {
    if (files.length < 2) return;
    stopAuto();
    timer = setInterval(() => go(index + 1), 5000);
  };

  const manual = (i) => { go(i); stopAuto(); startAuto(); };
  prev.addEventListener("click", () => manual(index - 1));
  next.addEventListener("click", () => manual(index + 1));
  dotEls.forEach((dot, di) => dot.addEventListener("click", () => manual(di)));
  container.addEventListener("mouseenter", stopAuto);
  container.addEventListener("mouseleave", startAuto);

  if (files.length < 2) {
    prev.style.display = "none";
    next.style.display = "none";
  }
  startAuto();
}

document.querySelectorAll(".project-gallery").forEach(buildGallery);

// ============================================================
// Galería de imágenes del blog (placeholder + visor ampliado)
// ============================================================
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

const reader = document.getElementById("reader");
const readerContent = document.getElementById("readerContent");
const readerClose = document.getElementById("readerClose");

let lastFocused = null;

// Bloquea el scroll del cuerpo solo mientras haya una vista abierta
function syncScrollLock() {
  document.body.style.overflow = (!reader.hidden || !lightbox.hidden) ? "hidden" : "";
}

function openLightbox(src, caption) {
  lightboxImg.src = src;
  lightboxImg.alt = caption || "";
  lightboxCaption.textContent = caption || "";
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  syncScrollLock();
  lightboxClose.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.removeAttribute("src");
  syncScrollLock();
}

document.addEventListener("error", (e) => {
  const img = e.target;
  if (img && img.tagName === "IMG") {
    const media = img.closest(".blog-media");
    if (media) media.classList.add("no-img");
  }
}, true);

document.addEventListener("click", (e) => {
  const media = e.target.closest(".blog-media");
  if (!media || media.classList.contains("no-img")) return;
  const img = media.querySelector("img");
  const caption = media.closest(".blog-figure")?.querySelector("figcaption")?.textContent?.trim();
  openLightbox(media.dataset.full || img?.src || "", caption);
});

if (lightbox && lightboxClose) {
  // La X visible mientras hay una imagen abierta cierra también la lectura
  lightboxClose.addEventListener("click", () => {
    if (!reader.hidden) closeReader();
    else closeLightbox();
  });
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
}

// ============================================================
// Vista de lectura completa del blog
// ============================================================
function openReader(entry) {
  lastFocused = document.activeElement;
  const date = entry.querySelector(".entry-date");
  const title = entry.querySelector("h3");
  const body = entry.querySelector(".entry-full .blog-body");
  readerContent.innerHTML = `
    <span class="reader-date">${date ? date.textContent : ""}</span>
    <h2 class="reader-title">${title ? title.textContent : ""}</h2>
    ${body ? body.innerHTML : ""}`;
  reader.classList.toggle("reader--light-text", entry.classList.contains("blog-entry--featured"));
  reader.hidden = false;
  reader.setAttribute("aria-hidden", "false");
  reader.scrollTop = 0;
  syncScrollLock();
  readerClose.focus();
}

// Cierra la lectura completa (y el visor de imágenes si está abierto)
function closeReader() {
  if (reader.hidden && lightbox.hidden) return;
  reader.hidden = true;
  reader.setAttribute("aria-hidden", "true");
  closeLightbox();
  syncScrollLock();
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

if (reader && readerClose) {
  document.querySelectorAll(".entry-toggle").forEach((btn) => {
    btn.addEventListener("click", () => openReader(btn.closest(".blog-entry")));
  });
  readerClose.addEventListener("click", closeReader);
  reader.addEventListener("click", (e) => { if (e.target === reader) closeReader(); });
}

// Escape cierra la vista superior: primero el visor de imágenes, luego la lectura
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!lightbox.hidden) { closeLightbox(); return; }
  if (!reader.hidden) closeReader();
});

document.getElementById("year").textContent = new Date().getFullYear();
