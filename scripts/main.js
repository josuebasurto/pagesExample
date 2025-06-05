document.addEventListener('DOMContentLoaded', () => {
  const posts = ['hola-mundo.md', 'otro-post.md'];
  const postsContainer = document.getElementById('blog-posts');

  Promise.all(
    posts.map(post =>
      fetch(`posts/${post}`).then(res => res.text())
    )
  ).then(markdowns => {
    const html = markdowns.map(md =>
      md
        .replace(/^# (.*$)/gim, '<h2>$1</h2>')
        .replace(/\n/g, '<br>')
    ).join('<hr>');
    postsContainer.innerHTML = html;
  });
});