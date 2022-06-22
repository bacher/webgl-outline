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

    const render = init(gl);
    // render();
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
