<?php
/**
 * Front page template.
 */
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
  <main style="min-height:100vh;display:grid;place-items:center;background:#f4f7f2;color:#172018;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;">
    <section style="max-width:720px;text-align:center;">
      <p style="margin:0 0 12px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#4f6f52;">Rishiri Recruit 2026</p>
      <h1 style="margin:0 0 16px;font-size:clamp(40px,8vw,88px);line-height:1;">My Next.js Theme</h1>
      <p style="margin:0 auto;font-size:18px;line-height:1.8;color:#3f4f42;">
        WordPress theme is active. This is a temporary top page before the Headless WordPress + Next.js 3D site is connected.
      </p>
    </section>
  </main>
  <?php wp_footer(); ?>
</body>
</html>
