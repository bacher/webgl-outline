import { useEffect, useRef, useState } from 'react';

import { init } from '../../utils/scenes/outline';
// import { init } from '../../utils/scenes/multisampleFramebuffer';

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

      const interval = 20;

      const intervalId = setInterval(() => {
        i++;
        setRotation(-i * 5 * (interval / 100));
        draw();
      }, interval);

      return () => {
        clearInterval(intervalId);
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
