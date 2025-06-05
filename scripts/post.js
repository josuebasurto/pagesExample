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

function markdownToHtml(md) {
  let html = md
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
  html = html.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('');
  return html;
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
        });
    });
});