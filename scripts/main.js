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

function markdownToHtml(md) {
  // Procesa títulos primero
  let html = md
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');

  // Divide en bloques por dobles saltos de línea
  html = html.split(/\n{2,}/).map(block => {
    // Si ya es un título o lista, no lo envuelvas en <p>
    if (/^<h[23]>.*<\/h[23]>$/.test(block.trim()) || /^<li>.*<\/li>$/.test(block.trim())) {
      return block.trim();
    }
    return `<p>${block.trim()}</p>`;
  }).join('');
  return html;
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
  // Convierte el título en un enlace
  let html = md.replace(/^# (.*$)/m, `<h2><a href="post.html?slug=${postMeta.slug}">$1</a></h2>`);
  html = html
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
  html = html.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('');
  return banner + dateHtml + html;
}

document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : '');
};
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}