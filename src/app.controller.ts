import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { AppService, createOrder } from './app.service.js';

const products = ['Laptop', 'Telefon', 'Tablet'];

type OrderForm = {
  product: string;
  customerName: string;
  billingCity: string;
  billingZip: string;
  billingStreet: string;
  shippingCity: string;
  shippingZip: string;
  shippingStreet: string;
  phone: string;
  coupon: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvc: string;
};

function validate(body: OrderForm) {
  if (!products.includes(body.product)) {
    return 'Válassz terméket!';
  }

  const nameRegex =
    /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+(?:[ \-][A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+)+$/;
  if (!nameRegex.test(body.customerName ?? '')) {
    return 'Hibás név!';
  }

  const cityRegex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű.\- ]{2,}$/;
  const zipRegex = /^\d{4}$/;
  const streetRegex = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű.\- ]+\s+\d+[\/A-Za-z0-9.]*$/;

  if (!cityRegex.test(body.billingCity ?? '')) {
    return 'Hibás számlázási város!';
  }
  if (!zipRegex.test(body.billingZip ?? '')) {
    return 'A számlázási irányítószám 4 számjegyű legyen!';
  }
  if (!streetRegex.test(body.billingStreet ?? '')) {
    return 'A számlázási címhez add meg az utcát és a házszámot!';
  }

  if (!cityRegex.test(body.shippingCity ?? '')) {
    return 'Hibás szállítási város!';
  }
  if (!zipRegex.test(body.shippingZip ?? '')) {
    return 'A szállítási irányítószám 4 számjegyű legyen!';
  }
  if (!streetRegex.test(body.shippingStreet ?? '')) {
    return 'A szállítási címhez add meg az utcát és a házszámot!';
  }

  if (!/^\+36(20|30|31|50|70)\d{7}$/.test(body.phone ?? '')) {
    return 'Hibás telefonszám, például: +36201234567';
  }

  if (body.coupon && !/^[A-Z]{2}-\d{4}$/.test(body.coupon)) {
    return 'Hibás kuponkód, például: PT-1255';
  }

  const cardNumber = (body.cardNumber ?? '').replaceAll(' ', '');
  if (!/^\d{16}$/.test(cardNumber)) {
    return 'Hibás bankkártyaszám!';
  }
  if (!/\S/.test(body.cardName ?? '')) {
    return 'Add meg a kártyán szereplő nevet!';
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(body.cardExpiry ?? '')) {
    return 'Hibás lejárati dátum, például: 12/28';
  }
  if (!/^\d{3}$/.test(body.cardCvc ?? '')) {
    return 'Hibás CVC kód!';
  }

  return '';
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Render('index')
  getHello() {
    return {
      values: {},
    };
  }

  @Post()
  @Render('index')
  async postOrder(@Body() body: OrderForm) {
    const values = {
      product: body.product,
      customerName: body.customerName,
      billingCity: body.billingCity,
      billingZip: body.billingZip,
      billingStreet: body.billingStreet,
      shippingCity: body.shippingCity,
      shippingZip: body.shippingZip,
      shippingStreet: body.shippingStreet,
      phone: body.phone,
      coupon: body.coupon,
    };

    const error = validate(body);
    if (error) {
      return { error, values };
    }

    try {
      await createOrder({
        product: body.product,
        customerName: body.customerName,
        billingAddress: `${body.billingZip} ${body.billingCity}, ${body.billingStreet}`,
        shippingAddress: `${body.shippingZip} ${body.shippingCity}, ${body.shippingStreet}`,
      });
    } catch {
      return { error: 'Hiba történt a mentés során, próbáld újra!', values };
    }

    return { success: 'Sikeres rendelés', values: {} };
  }
}
