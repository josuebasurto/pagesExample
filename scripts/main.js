document.addEventListener('DOMContentLoaded', () => {
  fetch('posts.json')
    .then(res => res.json())
    .then(posts => {
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
  return md
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^<p>/, '')
    .replace(/<\/p>$/, '');
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
  const banner = `<div class="post-banner">
    📢 Banner del post
  </div>`;
  const dateHtml = postMeta?.date
    ? `<div class="post-date">${formatDate(postMeta.date)}</div>`
    : '';
  return banner + dateHtml + markdownToHtml(md);
}

document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : '');
};
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}