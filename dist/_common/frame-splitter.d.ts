interface FrameSplitterOptions {
    targetFrameSize: number;
}
export type Frame = {
    samples: Float32Array;
    isEmpty: boolean;
};
export declare class FrameSplitter {
    options: FrameSplitterOptions;
    inputBuffer: Array<number>;
    constructor(options: FrameSplitterOptions);
    process: (audioFrame: Float32Array) => Frame[];
}
export {};
//# sourceMappingURL=frame-splitter.d.ts.map