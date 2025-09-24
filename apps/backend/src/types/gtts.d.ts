declare module "gtts" {
  export default class gTTS {
    constructor(text: string, lang?: string);
    save(filepath: string, callback: (err: any) => void): void;
    stream(): NodeJS.ReadableStream;
  }
}
