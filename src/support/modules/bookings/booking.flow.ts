import type { IsoDate } from '../../core/dates';
import type { BookingReceiptPage } from './booking-receipt.page';
import type { BookingRequestPage } from './booking-request.page';

export interface RequestedBooking {
  id: string;
  code: string;
}

/**
 * Jornada multi-tela do hóspede: escolher datas → enviar → cair no comprovante.
 * Flows orquestram Page Objects; não conhecem locators nem fazem asserções finas.
 */
export class BookingFlow {
  constructor(
    private readonly request: BookingRequestPage,
    private readonly receipt: BookingReceiptPage,
  ) {}

  async requestStay(
    slug: string,
    stay: { checkin: IsoDate; checkout: IsoDate; notes?: string },
  ): Promise<RequestedBooking> {
    await this.request.open(slug);
    await this.request.selectStay(stay.checkin, stay.checkout);
    if (stay.notes) await this.request.fillGuest({ observacoes: stay.notes });
    await this.request.submit();
    await this.receipt.expectLoaded();
    return { id: this.receipt.bookingIdFromUrl(), code: await this.receipt.bookingCode() };
  }
}
