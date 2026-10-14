import { expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

/**
 * Servidor HTTP local que só registra quem bateu nele.
 *
 * Detecta SSRF: se o servidor do cabanas-web buscar uma URL informada pelo
 * usuário, a requisição chega aqui. Escuta em 127.0.0.1, o mesmo endereço que
 * um atacante usaria para alcançar serviços internos.
 */
export class CanaryProbe {
  private readonly hits: string[] = [];
  private server?: Server;
  private port = 0;

  async start(): Promise<void> {
    this.server = createServer((req, res) => {
      this.hits.push(`${req.method} ${req.url}`);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body>canario</body></html>');
    });
    await new Promise<void>((resolve) => this.server?.listen(0, '127.0.0.1', resolve));
    this.port = (this.server.address() as AddressInfo).port;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) => (this.server ? this.server.close(() => resolve()) : resolve()));
  }

  /** URL que imita um link do Google Maps, apontando para o canário. */
  get mapsLikeUrl(): string {
    return `http://127.0.0.1:${this.port}/maps/place/cabana`;
  }

  expectNoRequests(): void {
    expect(this.hits, 'requisições recebidas pelo canário').toEqual([]);
  }
}
