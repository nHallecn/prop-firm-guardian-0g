declare module '@0gfoundation/0g-storage-ts-sdk/browser' {
  export * from '@0gfoundation/0g-storage-ts-sdk';
  import { AbstractFile } from '@0gfoundation/0g-storage-ts-sdk';

  export class Blob extends AbstractFile {
    constructor(blob: globalThis.Blob | Uint8Array);
  }
}
