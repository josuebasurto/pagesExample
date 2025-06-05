function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
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

/**
 * Convierte texto Markdown a HTML básico para mostrar posts individuales.
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

document.addEventListener('DOMContentLoaded', () => {
  const slug = getSlug();
  if (!slug) {
    document.getElementById('post-content').innerHTML = '<p>Post no encontrado.</p>';
    return;
  }
  
  fetch('posts.json')
    .then(res => res.json())
    .then(posts => {
      const postMeta = posts.find(p => p.slug === slug);
      if (!postMeta) {
        document.getElementById('post-content').innerHTML = '<p>Post no encontrado.</p>';
        return;
      }
      
      fetch(`posts/${slug}.md`)
        .then(res => res.text())
        .then(md => {
          const bannerUrl = postMeta.banner || "https://placehold.co/700x120?text=Banner+del+post";
          const banner = `<div class="post-banner-img">
            <img src="${bannerUrl}" alt="Banner del post" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;">
          </div>`;
          const dateHtml = postMeta.date
            ? `<div class="post-date">${formatDate(postMeta.date)}</div>`
            : '';
          
          document.getElementById('post-content').innerHTML =
            banner + dateHtml + markdownToHtml(md) +
            `<p><a href="index.html">← Volver al blog</a></p>`;
        })
        .catch(error => {
          console.error('Error cargando el post:', error);
          document.getElementById('post-content').innerHTML = '<p>Error cargando el contenido del post.</p>';
        });
    })
    .catch(error => {
      console.error('Error cargando posts.json:', error);
      document.getElementById('post-content').innerHTML = '<p>Error cargando la información del post.</p>';
    });
});