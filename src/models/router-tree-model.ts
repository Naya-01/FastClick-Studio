import { Pair } from "./pair";

export class RouterElement {
  constructor(
    public name: string,
    public type: string,
    public configuration: string,
    public children: RouterElement[] = []
  ) {}
}

export class RouterTreeModel {
  private elements: Map<string, RouterElement> = new Map();
  private pairs: Pair[] = [];

  constructor(config: string) {
    this.pairs = this.parseClickString(config);
  }

  private parseClickString(input: string): Pair[] {
    const pairs: Pair[] = [];
    const sequencePart = input.split(';').filter(part => part.includes('->'));

    if (!sequencePart.length) {
      return pairs;
    }

    sequencePart.forEach(sequence => {
      const elements = sequence
        .split('->')
        .map(item => item.trim().replace(/(^\[\d+\])|(\[\d+\]$)/g, '').replace(/\s+/g, ''))
        .filter(item => item);

      for (let i = 0; i < elements.length - 1; i++) {
        let currentElement = elements[i];
        let nextElement = elements[i + 1];

        if (!this.elements.has(currentElement)) {
          this.elements.set(currentElement, new RouterElement(currentElement, '', ''));
        }

        const pairExists = pairs.some(pair => pair.source === currentElement && pair.destination === nextElement);
        if (!pairExists) {
          pairs.push(new Pair(currentElement, nextElement));
        }
      }
    });

    return pairs;
  }

  getElement(name: string): RouterElement | undefined {
    return this.elements.get(name);
  }

  getAllElements(): RouterElement[] {
    return Array.from(this.elements.values());
  }

  getAllPairs(): Pair[] {
    return this.pairs;
  }
}
