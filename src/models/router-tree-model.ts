import { Pair } from "./pair";

export class RouterElement {
  constructor(
    public name: string,
    public type: string,
    public configuration: string,
    public children: RouterElement[] = []
  ) {}
}

interface SequenceInfo {
  sequence: string;
  startElement: string;
  port: number | null;
}


export class RouterTreeModel {
  private elements: Map<string, RouterElement> = new Map();
  private pairs: Pair[] = [];

  constructor(config: string) {
    this.parseElements(config);
    this.pairs = this.parseClickString(config);    
    console.log(this.elements);
    
  }


  private parseElements(input: string): void {
    const elementDefinitions = input.split(';').filter(line => line.includes('::'));

    elementDefinitions.forEach(line => {
      const [nameAndType, configPart] = line.split('::').map(part => part.trim());

      const nameMatch = nameAndType.match(/^([^\s@]+)(@\d+)?$/);
      const name = nameMatch ? nameMatch[0].trim() : nameAndType.trim();

      const typeMatch = configPart.match(/^(\w+)\s*(\((.*)\))?/);
      const type = typeMatch ? typeMatch[1] : '';
      const configuration = typeMatch && typeMatch[3] ? typeMatch[3] : '';

      if (!this.elements.has(name)) {
        this.elements.set(name, new RouterElement(name, type, configuration));
      }
    });
  }

  private parseClickString(input: string): Pair[] {
    const pairs: Pair[] = [];
    const sequencePart = input.split(';').filter(part => part.includes('->'));

    if (!sequencePart.length) {
      return pairs;
    }
    const sequences: SequenceInfo[] = [];

    sequencePart.forEach(sequence => {
      const sequenceTrimmed = sequence.trim();
      const lines = sequenceTrimmed.split('\n').map(line => line.trim()).filter(line => line);
      const sequenceJoined = lines.join(' ');
      const elements = sequenceJoined.split('->').map(item => item.trim()).filter(item => item);

      if (elements.length > 0) {
        const startToken = elements[0];
        let startElement = startToken;
        let port: number | null = null;
        const portMatch = startToken.match(/^([^\[\]]+)\s*\[\s*(\d+)\s*\]$/);
        if (portMatch) {
          startElement = portMatch[1].trim();
          port = parseInt(portMatch[2], 10);
        }
        sequences.push({ sequence: sequenceJoined, startElement, port });
      }
    });


    const sequencesByStartElement: { [key: string]: SequenceInfo[] } = {};

    sequences.forEach(seq => {
      if (!sequencesByStartElement[seq.startElement]) {
        sequencesByStartElement[seq.startElement] = [];
      }
      sequencesByStartElement[seq.startElement].push(seq);
    });

    for (const startElement in sequencesByStartElement) {
      const seqs = sequencesByStartElement[startElement];
      seqs.sort((a, b) => {
        if (a.port !== null && b.port !== null) {
          return a.port - b.port;
        } else if (a.port !== null) {
          return -1;
        } else if (b.port !== null) {
          return 1;
        } else {
          return 0;
        }
      });

      seqs.forEach(seqObj => {
        const sequence = seqObj.sequence;
        const elements = sequence.split('->').map(item => item.trim()).filter(item => item);

        for (let i = 0; i < elements.length - 1; i++) {
          let currentElementToken = elements[i];
          let nextElementToken = elements[i + 1];

          let currentElementName = currentElementToken;
          let match = currentElementToken.match(/^([^\[\]]+)\s*\[\s*(\d+)\s*\]$/);
          if (match) {
            currentElementName = match[1].trim();
          }

          let nextElementName = nextElementToken;
          match = nextElementToken.match(/^([^\[\]]+)\s*\[\s*(\d+)\s*\]$/);
          if (match) {
            nextElementName = match[1].trim();
          }

          if (!this.elements.has(currentElementName)) {
            this.elements.set(currentElementName, new RouterElement(currentElementName, '', ''));
          }

          if (!this.elements.has(nextElementName)) {
            this.elements.set(nextElementName, new RouterElement(nextElementName, '', ''));
          }

          const pairExists = pairs.some(pair => 
            pair.source === currentElementName &&
            pair.destination === nextElementName
          );
          if (!pairExists) {
            pairs.push(new Pair(currentElementName, nextElementName));
          }
        }
      });
    }

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
