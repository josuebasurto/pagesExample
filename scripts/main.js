document.addEventListener('DOMContentLoaded', () => {
  const posts = ['hola-mundo.md', 'otro-post.md'];
  const postsContainer = document.getElementById('blog-posts');

  Promise.all(
    posts.map(post =>
      fetch(`posts/${post}`).then(res => res.text())
    )
  ).then(markdowns => {
    const html = markdowns.map(md => markdownToHtml(md)).join('<hr>');
    postsContainer.innerHTML = html;
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

document.getElementById('toggle-theme').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : '');
};
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}