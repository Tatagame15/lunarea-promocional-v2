// Smooth scroll for the hero CTA button
const ctaBtn = document.querySelector('.cta');
if (ctaBtn) {
  ctaBtn.addEventListener('click', () => {
    const target = document.getElementById(ctaBtn.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
}
