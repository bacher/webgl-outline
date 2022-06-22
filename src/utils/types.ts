export type VertexShaderInfo = {
  source: string;
  uniforms: string[];
  attributes: string[];
};

export type FragmentShaderInfo = {
  source: string;
  uniforms: string[];
};

export type ShaderProgram = {
  program: WebGLProgram;
  activate: () => void;
  locations: {
    getUniform: (uniformName: string) => WebGLUniformLocation | null;
    getAttribute: (attributeName: string) => number;
  };
  setUniformInt: (uniformName: string, value: number) => void;
  setUniformUInt: (uniformName: string, value: number) => void;
  setUniformUIntArray: (uniformName: string, value: Uint32Array) => void;
  setUniform3Float: (
    uniformName: string,
    value: [number, number, number],
  ) => void;
  setUniform4Float: (
    uniformName: string,
    value: [number, number, number, number],
  ) => void;
  setUniformMat4: (uniformName: string, value: Float32List) => void;
};
