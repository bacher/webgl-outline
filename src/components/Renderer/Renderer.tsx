import { useEffect, useRef, useState } from 'react';

import { init } from '../../utils/render';

export function Renderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [errorText, setErrorText] = useState<string | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl2');

    if (!gl) {
      setErrorText('WebGL2 does not supported');
      return;
    }

    const { drawScene, setRotation } = init(gl, {
      width: canvas.width,
      height: canvas.height,
    });

    if (window.location.search.includes('animate')) {
      let i = 0;

      const intervalId = setInterval(() => {
        i++;
        setRotation(-i);
        drawScene();
      }, 100);

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
