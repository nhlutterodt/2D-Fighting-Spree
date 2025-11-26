/**
 * Lightweight overlay for pause/menus drawn directly on the canvas.
 */
export function createPauseOverlayScene({ label = 'Paused', hint = 'Press Resume to return' } = {}) {
  return () => ({
    id: 'pause-overlay',
    render(ctx, { width, height }) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#e0e7ff';
      ctx.font = 'bold 28px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, width / 2, height / 2 - 10);

      ctx.fillStyle = '#cbd5f5';
      ctx.font = '14px ui-sans-serif, system-ui';
      ctx.fillText(hint, width / 2, height / 2 + 20);
      ctx.restore();
    },
  });
}
