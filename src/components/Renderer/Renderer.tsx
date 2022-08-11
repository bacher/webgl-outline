import { useEffect, useRef, useState } from 'react';

// import { init } from '../../utils/scenes/outline';
// import { init } from '../../utils/scenes/multisampleFramebuffer';
// import { init } from '../../utils/scenes/simple';
import { init } from '../../utils/scenes/screenPart';

export function Renderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorText, setErrorText] = useState<string | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current!;
    // const gl = canvas.getContext('webgl2', { stencil: true });
    const gl = canvas.getContext('webgl2', { stencil: true, antialias: false });

    if (!gl) {
      setErrorText('WebGL2 does not supported');
      return;
    }

    (window as any).gl = gl;

    const { draw, setRotation } = init(gl, {
      width: canvas.width,
      height: canvas.height,
    });

    if (window.location.search.includes('animate')) {
      let i = 0;

      const interval = 16;
      let intervalId: number;

      const ddd = () => {
        i++;
        setRotation(-i * 5 * (interval / 100));
        draw();
        intervalId = requestAnimationFrame(ddd);
      };

      intervalId = requestAnimationFrame(ddd);

      // Scissor box ?
      // Dither ?

      return () => {
        cancelAnimationFrame(intervalId);
      };
    }
  }, []);

  return (
    <div>
      {errorText ? (
        <div>{errorText}</div>
      ) : (
        <canvas ref={canvasRef} width={800} height={400} />
      )}
    </div>
  );
}
