// @ts-ignore
import { Frame } from "./frame-splitter"
import { log } from "./logging"

export type ONNXRuntimeAPI = any
export type ModelFetcher = () => Promise<ArrayBuffer>

export interface SpeechProbabilities {
  notSpeech: number
  isSpeech: number
}

export interface Model {
  reset_state: () => void
  process: (arr: Float32Array) => Promise<SpeechProbabilities>
}

export class Silero {
  _session:
    | { run: (arg0: { input: any; h: any; c: any; sr: any }) => any }
    | undefined
  _h: any
  _c: any
  _sr: any

  constructor(
    private ort: ONNXRuntimeAPI,
    private modelFetcher: ModelFetcher
  ) {}

  static new = async (ort: ONNXRuntimeAPI, modelFetcher: ModelFetcher) => {
    const model = new Silero(ort, modelFetcher)
    await model.init()
    return model
  }

  init = async () => {
    const modelArrayBuffer = await this.modelFetcher()
    this._session = await this.ort.InferenceSession.create(modelArrayBuffer)
    // @ts-ignore
    this._sr = new this.ort.Tensor("int64", [16000n])
    this.reset_state()
  }

  reset_state = () => {
    const zeroes = Array(2 * 64).fill(0)
    this._h = new this.ort.Tensor("float32", zeroes, [2, 1, 64])
    this._c = new this.ort.Tensor("float32", zeroes, [2, 1, 64])
  }

  process = async (audioFrameFull: Frame): Promise<SpeechProbabilities> => {
    if (!this._session) throw new Error("Silero model not initialized")
    // Silero has a bug where it infers absolute silence as speech - this is a workaround
    if (audioFrameFull.isEmpty) return { notSpeech: 1, isSpeech: 0 }

    const audioFrame = audioFrameFull.samples

    const t = new this.ort.Tensor("float32", audioFrame, [1, audioFrame.length])
    const inputs = {
      input: t,
      h: this._h,
      c: this._c,
      sr: this._sr,
    }
    const out = await this._session.run(inputs)
    this._h = out.hn
    this._c = out.cn
    const [isSpeech] = out.output.data
    const notSpeech = 1 - isSpeech
    return { notSpeech, isSpeech }
  }
}
