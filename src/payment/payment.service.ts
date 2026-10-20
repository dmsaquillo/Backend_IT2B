import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';

@Injectable()
export class PaymentService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

async createPayment(
  reservation_id: string,
  amount: number,
  payment_method: string,
  payment_status: string,
  reference_number: string,
) {
  const [result] = await this.pool().execute<OkPacket>(
    `INSERT INTO payment
    (
      reservation_id,
      amount,
      payment_method,
      payment_status,
      reference_number
    )
    VALUES (?, ?, ?, ?, ?)`,
    [
      reservation_id,
      amount,
      payment_method,
      payment_status,
      reference_number,
    ],
  );

  return {
    payment_id: result.insertId,
    reservation_id,
    amount,
    payment_method,
    payment_status,
    reference_number,
  };
}
  async findBypayment_Id(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        payment_id,
        reservation_id,
        payment_date,
        amount,
        payment_method,
        payment_status,
        reference_number
       FROM payments
       WHERE payment_id = ?`,
      [id],
    );

    if (rows.length === 0) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return rows[0];
  }

  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      `SELECT
        payment_id,
        reservation_id,
        payment_date,
        amount,
        payment_method,
        payment_status,
        reference_number
       FROM payments`,
    );

    return rows;
  }

  async updatePayment(
    id: number,
    partial: {
      reservation_id?: string;
      payment_date?: number;
      amount?: number;
      payment_method?: string;
      payment_status?: string;
      reference_number?: string;
    },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.reservation_id !== undefined) {
      fields.push('reservation_id = ?');
      values.push(partial.reservation_id);
    }

    if (partial.payment_date !== undefined) {
      fields.push('payment_date = ?');
      values.push(partial.payment_date);
    }

    if (partial.amount !== undefined) {
      fields.push('amount = ?');
      values.push(partial.amount);
    }

    if (partial.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(partial.payment_method);
    }

    if (partial.payment_status !== undefined) {
      fields.push('payment_status = ?');
      values.push(partial.payment_status);
    }

    if (partial.reference_number !== undefined) {
      fields.push('reference_number = ?');
      values.push(partial.reference_number);
    }

    if (fields.length === 0) {
      return this.findBypayment_Id(id);
    }

    values.push(id);

    const sql = `UPDATE payments SET ${fields.join(', ')} WHERE payment_id = ?`;

    await this.pool().execute(sql, values);

    return this.findBypayment_Id(id);
  }

  async deletePayment(payment_id: number) {
    const [result] = await this.pool().execute<OkPacket>(
      'DELETE FROM payments WHERE payment_id = ?',
      [payment_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException(`Payment ${payment_id} not found`);
    }

    return {
      message: `Payment ${payment_id} deleted successfully`,
    };
  }
}