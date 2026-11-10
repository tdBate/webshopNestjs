import { Injectable } from '@nestjs/common';

import mysql from 'mysql2/promise';

const mysqlConnection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'webshop',
});

export type Order = {
  product: string;
  customerName: string;
  billingAddress: string;
  shippingAddress: string;
};

export async function createOrder(order: Order) {
  await mysqlConnection.execute(
    'INSERT INTO orders (product, customerName, billingAddress, shippingAddress) VALUES (?, ?, ?, ?)',
    [
      order.product,
      order.customerName,
      order.billingAddress,
      order.shippingAddress,
    ],
  );
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
