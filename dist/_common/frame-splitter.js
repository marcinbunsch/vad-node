"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameSplitter = void 0;
// Frame splitter is a version of the resampler which works faster and doesn't
// do any resampling. It just splits the audio into frames of a fixed size.
class FrameSplitter {
    constructor(options) {
        this.options = options;
        this.process = (audioFrame) => {
            const outputFrames = [];
            let outputIndex = 0;
            let outputFrame = {
                samples: new Float32Array(this.options.targetFrameSize),
                isEmpty: true,
            };
            for (const sample of audioFrame) {
                if (outputFrame.isEmpty && sample !== 0)
                    outputFrame.isEmpty = false;
                outputFrame.samples[outputIndex] = sample;
                outputIndex++;
                if (outputIndex >= this.options.targetFrameSize) {
                    outputFrames.push(outputFrame);
                    outputFrame = {
                        samples: new Float32Array(this.options.targetFrameSize),
                        isEmpty: true,
                    };
                    outputIndex = 0;
                }
            }
            return outputFrames;
        };
        this.inputBuffer = [];
    }
}
exports.FrameSplitter = FrameSplitter;
//# sourceMappingURL=frame-splitter.js.map