/**
 * Kept as CommonJS `.js`: this is the form Next.js reliably picks up here.
 * With only a `.mjs` variant present, Tailwind's utility layer was not emitted
 * at all — the stylesheet dropped to ~9KB and every utility class was missing.
 */
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
