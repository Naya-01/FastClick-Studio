export class Pair {
    constructor(
      public source: string,
      public destination: string | null,
      public sourcePort: number | null = null,
      public destinationPort: number | null = null
    ) {}
  }
  