document.addEventListener('DOMContentLoaded', () => {
  fetch('posts.json')
    .then(res => res.json())
    .then(posts => {
      // Ordena los posts por fecha descendente
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      const postsContainer = document.getElementById('blog-posts');
      Promise.all(
        posts.map(post =>
          fetch(`posts/${post.slug}.md`).then(res => res.text())
            .then(md => renderPostWithBanner(md, post))
        )
      ).then(htmls => {
        postsContainer.innerHTML = htmls.join('<hr>');
      });
    });
});

/**
 * Convierte texto Markdown a HTML básico para mostrar posts en el blog.
 * Soporta títulos, listas, imágenes, enlaces, negritas, cursivas y separación de párrafos.
 * @param {string} md - El texto en formato Markdown.
 * @returns {string} - El HTML generado.
 */
function markdownToHtml(md) {
  // Títulos de nivel 1, 2 y 3
  md = md.replace(/^# (.*)$/gim, '<h2>$1</h2>');
  md = md.replace(/^## (.*)$/gim, '<h3>$1</h3>');
  md = md.replace(/^### (.*)$/gim, '<h4>$1</h4>');
  
  // Imágenes
  md = md.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;">');
  
  // Enlaces
  md = md.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
  
  // Negritas y cursivas
  md = md.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  md = md.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Listas no ordenadas
  md = md.replace(/^\* (.*)$/gim, '<li>$1</li>');
  md = md.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // Divide en bloques por dobles saltos de línea y envuelve en <p> si corresponde
  return md.split(/\n{2,}/).map(block => {
    const trimmed = block.trim();
    // No envolver títulos, listas, imágenes o elementos de bloque en <p>
    if (
      /^<h[234]>.*<\/h[234]>$/.test(trimmed) ||
      /^<ul>.*<\/ul>$/.test(trimmed) ||
      /^<ol>.*<\/ol>$/.test(trimmed) ||
      /^<img.*>$/.test(trimmed) ||
      /^<table>.*<\/table>$/.test(trimmed) ||
      trimmed === ''
    ) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  }).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const diaSemana = dias[date.getDay()];
  const dia = date.getDate();
  const mes = meses[date.getMonth()];
  const año = date.getFullYear();
  const hora = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  return `${diaSemana} ${dia} de ${mes} de ${año} a las ${hora}:${minutos} hrs.`;
}

function renderPostWithBanner(md, postMeta) {
  const bannerUrl = postMeta?.banner || "https://placehold.co/700x120?text=Banner+del+post";
  const banner = `<div class="post-banner-img">
    <img src="${bannerUrl}" alt="Banner del post" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;">
  </div>`;
  const dateHtml = postMeta?.date
    ? `<div class="post-date">${formatDate(postMeta.date)}</div>`
    : '';
  
  // Convierte el título principal en enlace a la página individual del post
  let html = md.replace(/^# (.*$)/m, `<h2><a href="post.html?slug=${postMeta.slug}">$1</a></h2>`);
  html = markdownToHtml(html);
  
  return banner + dateHtml + html;
}

// Funcionalidad del tema oscuro (si existe el botón)
const toggleTheme = document.getElementById('toggle-theme');
if (toggleTheme) {
  toggleTheme.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : '');
  };
}

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}